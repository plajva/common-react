import { jwtParse } from '@common/utils';
import { filter, map, merge, Observable, of, shareReplay, startWith, Subject, switchMap } from 'rxjs';
import { useObservable } from './rxjs_utils';

// Object shouldn't change, should only be imported/exported
export const token: any = {};
const _token_login$ = new Subject<string>();
export const login = (v:string) => _token_login$.next(v);
const _token_logout$ = new Subject<false>();
export const logout = () => _token_logout$.next(false);
// Observable wich will be false if user has logged out
const token$ = merge(_token_login$, _token_logout$).pipe(
	startWith(localStorage.getItem('token') ?? (false as const)),
	/** Expiration check */
	switchMap(
		(token) =>
			new Observable<string | false>((s) => {
				const logout = (exp?) => {
					console.log(`Logging user out${exp ? `, token expired ${exp}` : ''}`);
					s.next(false);
					s.complete();
					return;
				};
				if (!token) logout();
				const jwt = jwtParse(token);
				if (!jwt?.exp) logout();
				const exp = Number(jwt.exp) * 1000;
				const expired = Date.now() > exp;
				if (expired) logout(exp);
				s.next(token);
				const t = setTimeout(logout, exp - Date.now());
				s.add(() => clearTimeout(t));
			})
	),
	/** Map token to object */
	shareReplay(1)
);

/**
 * An imperative handle to logged in status
 * @returns weither there's a logged in user or not
 */
export const isLoggedIn = () => _is_logged_in;

let _is_logged_in = false;
// Actions on login/logout
token$.subscribe((_token) => {
	if (_token) {
		// User Logged in
		_is_logged_in = true;
		localStorage.setItem('token', _token);
		Object.assign(token, jwtParse(_token));
	} else {
		// User Logged out
		_is_logged_in = false;
		localStorage.removeItem('token');
		for (const k in token) {
			delete token[k];
		}
	}
});

export const useTokenChanged = () => useObservable(token$, undefined);
export const tokenValid$ = token$.pipe(
	filter((token) => !!token),
	map((token) => ({ token }))
);
export const tokenValidParsed$ = tokenValid$.pipe(map((v) => jwtParse(v.token)));
