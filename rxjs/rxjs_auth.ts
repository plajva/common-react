import { jwtParse } from '@common/utils'
import { filter, map, merge, Observable, shareReplay, startWith, Subject, switchMap } from 'rxjs'
import { useObservable } from './rxjs_react'

// Object shouldn't change, should only be imported/exported
// For use in components that need immediate use of token claims
export const token: any = {}
// For use in components that need immediate use of the encoded token
export const token_encoded = { string: '' }
const _token_login$ = new Subject<string>()
export const login = (v: string) => _token_login$.next(v)
const _token_logout$ = new Subject<false>()
export const logout = () => {
	console.log("Logout f triggered!")
	_token_logout$.next(false)
}
// Observable wich will be false if user has logged out
export const token$ = merge(_token_login$, _token_logout$).pipe(
	startWith(localStorage.getItem('token') ?? (false as const)),
	/** Expiration check */
	switchMap(
		(token) =>
			new Observable<string | false>((s) => {
				console.log("Got token: ", token)
				const logout = (exp?) => {
					console.log(`Logging user out${exp ? `, token expired ${exp}` : ''}`)
					s.next(false)
					s.complete()
					return
				}
				if (!token) return logout()
				const jwt = jwtParse(token)
				if (!jwt?.exp) return logout()
				const exp = Number(jwt.exp) * 1000
				const expired = Date.now() > exp
				if (expired) return logout(exp)
				s.next(token)
				const t = setTimeout(logout, exp - Date.now())
				s.add(() => clearTimeout(t))
			})
	),
	/** Map token to object */
	shareReplay(1)
)

/**
 * An imperative handle to logged in status
 * @returns weither there's a logged in user or not
 */
export const isLoggedIn = () => _is_logged_in

let _is_logged_in = false
// Actions on login/logout
token$.subscribe((_token) => {
	if (_token) {
		// User Logged in
		_is_logged_in = true
		localStorage.setItem('token', _token)
		token_encoded.string = _token
		console.log("Set token_encoded", token_encoded);
		Object.assign(token, jwtParse(_token))
	} else {
		// User Logged out
		_is_logged_in = false
		localStorage.removeItem('token')
		token_encoded.string = ''
		console.log("Removed token_encoded", token_encoded);
		for (const k in token) {
			delete token[k]
		}
	}
})

// export const _token_marketing_redirect = new Subject<string>();
// const _token_marketing_redirect$ = _token_marketing_redirect.pipe(
// 	startWith(localStorage.getItem('marketing_redirect_token') || ""),
// 	shareReplay(1)
// )
// _token_marketing_redirect$.subscribe((_token) => {
// 	localStorage.setItem("marketing_redirect_token", _token ?? "")
// })
// export const useTokenMarketingRedirectChanged = () => useObservable(_token_marketing_redirect$, undefined)

export const useTokenChanged = () => useObservable(token$, undefined)

export const tokenValid$ = token$.pipe(
	filter((token) => !!token),
	map((token) => ({ token }))
)
export const tokenValidParsed$ = tokenValid$.pipe(map((v) => jwtParse(v.token)))
