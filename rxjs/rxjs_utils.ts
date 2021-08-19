import {} from '@common/utils';
import { useEffect, useState } from 'react';
import { catchError, from, map, Observable, of, shareReplay, startWith, Subject, switchMap } from 'rxjs';
import { fromFetch } from 'rxjs/fetch';

// ! This is to be moved out of common if it's to actually be 'common'
// Implementation error handling should not be common as different APIs return different error values

export interface ResponseFetch<T> {
    errors?: boolean;
    message?: string;
    loading?: boolean;
    data?: T;
}
export type ResponseFetchValid<T extends ResponseFetch<any>> = Required<Pick<Exclude<T, undefined | null>, 'data'>>;
export type ResponseFetchErrors<T extends ResponseFetch<any>> = Required<
    Pick<Exclude<T, undefined | null>, 'errors' | 'message'>
>;

export const QueryError = ({ query }) => {
    return (query?.errors && query?.message) || '';
};

export const responseSelector = <T>(response: T, selector: (v: ResponseFetchValid<T>) => any) => {
    const vv = responseIsValid<T>(response);
    if (vv) {
        return selector(vv);
    }
};

export const useObservable = (observable, defaultValue?) => {
    const [state, setState] = useState(defaultValue);

    useEffect(() => {
        const sub = observable.subscribe(setState);
        return () => sub.unsubscribe();
    }, [observable]);

    return state;
};

export const responseIsValid = <T extends ResponseFetch<any>>(v): ResponseFetchValid<T> =>
    (v && !v.errors && !v.loading && !v.message && v) || undefined;
export const responseIsError = <T extends ResponseFetch<any>>(v): ResponseFetchErrors<T> =>
    (v && v.errors) || undefined;

const fetchInit: ResponseFetch<any> = { loading: true, data: undefined };
export const createAPIFetch = <T>(
    endpoint: string,
    init?: RequestInit,
    okReturn?: (res: Response) => Observable<T>
): Observable<ResponseFetch<T>> => {
    // Attach / if not present in endpoint
    if (endpoint[0] !== '/') endpoint = '/' + endpoint;
    if (!process.env.REACT_APP_API_URL) throw new Error(`process.env.REACT_APP_API_URL undefined?`);
    const url = `${process.env.REACT_APP_API_URL}${endpoint}`;
    return fromFetch(url, init).pipe(
        switchMap((res) => {
            // The .split is to handle content types like 'application/json; charset=utf-8'
            let content_type = res.headers.get('Content-type')?.split(';')[0];
            // let content_size = res.headers.get
            if (res.ok) {
                return (
                    okReturn
                        ? okReturn(res)
                        : content_type === 'application/json'
                        ? from(res.json())
                        : content_type === 'text/plain'
                        ? from(res.text())
                        : of(undefined)
                ).pipe(map((v) => ({ data: v })));
            } else {
                switch (content_type) {
                    case 'application/json':
                        return from(res.json()).pipe(
                            map((v) => ({
                                errors: true,
                                message: String(v?.message) || `Error ${res.status}`,
                                data: undefined,
                            }))
                        );
                    case 'text/plain':
                        return from(res.text()).pipe(
                            map((v) => ({ errors: true, message: String(v) || `Error ${res.status}` }))
                        );
                    default:
                        return of({ errors: true, message: `Error ${res.status}` });
                }
            }
        }),
        catchError((err) => {
            console.error(err);
            return of({ errors: true, message: err.message });
        }),
        startWith(fetchInit)
    );
};
// ! ---------------------------------

export const createAPIFetchStatic = <R, D = undefined>(
    endpoint: string,
    init?: RequestInit,
    defaultValue?: any,
    okReturn?: (res: Response) => Observable<R>
): [() => ResponseFetch<R> | D, Observable<ResponseFetch<R>>] => {
    const o = createAPIFetch<R>(endpoint, init, okReturn).pipe(shareReplay(1));
    const useO = () => useObservable(o, defaultValue);
    return [useO, o];
};

export const queryString = (v?: any) => {
    if (typeof v !== 'object' || Array.isArray(v)) return '';
    else {
        return (
            '?' +
            Object.entries(v)
                .map(([k, v]) => `${k}=${v}`)
                .join('&')
        );
    }
};
/** To customize how to fetch the API */
export function createAPIFetchCustom<I extends {}, R, D = undefined>(
    toFetch: (val: I) => Observable<R>,
    options?: { defaultValue?: D; shareReplay?: boolean }
): [(v: I) => void, () => I | undefined, () => R | D, Observable<R>] {
    const _shareReplay = options?.shareReplay ?? true;

    const value$ = new Subject<I>();
    const setValue = (v: I) => value$.next(v);
    const useValue = () => useObservable(value$);
    let result$ = value$.pipe(switchMap(toFetch));
    if (_shareReplay) result$ = result$.pipe(shareReplay(1));
    const useResult = () => useObservable(result$, options?.defaultValue);
    return [setValue, useValue, useResult, result$];
}
/** To customize how to fetch the API */
export function createAPIFetchQuery<T extends {}, E = any>(endpoint: string, init?: RequestInit, defaultValue?: any) {
    return createAPIFetchCustom<T, ResponseFetch<E>>((val: T) => createAPIFetch(endpoint + queryString(val), init), {
        defaultValue,
    });
}
