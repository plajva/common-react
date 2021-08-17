import { setDefault } from '@common/utils';
import { bind, SUSPENSE } from '@react-rxjs/core';
import { useEffect, useState } from 'react';
import { catchError, from, map, Observable, of, shareReplay, startWith, Subject, switchMap } from 'rxjs';
import { fromFetch } from 'rxjs/fetch';

// ! This is to be moved out of common if it's to actually be 'common'
// Implementation error handling should not be common as different APIs return different error values
export interface APIFetchResponse {
    errors?: boolean;
    message?: string;
    loading?: boolean;
}
export const responseValid = <T>(v): Exclude<T, APIFetchResponse | undefined | null> =>
    v && !v.errors && !v.loading && !v.message && v;

export type ResponseFetch<T> = { data: T } | APIFetchResponse;
const fetchInit: APIFetchResponse = { loading: true };
export const createAPIFetch = <T>(
    endpoint: string,
    init?: RequestInit,
    okReturn?: (res: Response) => Observable<T>
): Observable<ResponseFetch<T>> => {
    // if(process.env.REACT_APP_API_HOST){
    //     // Add host if available
    //     init = {headers:{"Host":process.env.REACT_APP_API_HOST,...init?.headers},...init};
    // }

    if (endpoint[0] !== '/') endpoint = '/' + endpoint;
    if (!process.env.REACT_APP_API_URL) throw new Error(`process.env.REACT_APP_API_URL undefined?`);
    const url = `${process.env.REACT_APP_API_URL}${endpoint}`;
    return fromFetch(url, init).pipe(
        switchMap((res) => {
            let content_type = res.headers.get('Content-type');
            // let content_size = res.headers.get
            if (res.ok) {
                return (okReturn ? okReturn(res) : from(res.json())).pipe(map((v) => ({ data: v })));
            } else {
                switch (content_type) {
                    case 'application/json':
                        return from(res.json()).pipe(
                            map((v) => ({ errors: true, message: String(v?.message) || `Error ${res.status}` }))
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

export const createAPIFetchStatic = <T>(
    endpoint: string,
    init?: RequestInit,
    defaultValue?: any,
    okReturn?: (res: Response) => Observable<T>
) => bind<ResponseFetch<T>>(createAPIFetch<T>(endpoint, init, okReturn).pipe(shareReplay(1)), defaultValue || null);

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
export function createAPIFetchCustom<T extends {}, E>(
    toFetch: (val: T) => Observable<E>,
    options?: { defaultValue?: any; shareReplay?: boolean }
): [(v: T) => void, () => Exclude<T, typeof SUSPENSE> | null, () => Exclude<E, typeof SUSPENSE> | null, Observable<E>] {
    const _shareReplay = setDefault(options?.shareReplay, true);

    // const [value$, setValue] = createSignal<T>();
    // const [useValue, valueShare$] = bind(value$, null);
    // const result$ = value$.pipe(
    //     // Only update when parameters changed
    //     // distinctUntilChanged((prev, curr) => {
    //     // 	// console.log('Prev', JSON.stringify(prev))
    //     // 	// console.log('Curr', JSON.stringify(curr))
    //     // 	return isEqual(JSON.stringify(prev), JSON.stringify(curr))
    //     // }),
    //     switchMap(toFetch),
    //     shareReplay(1)
    // );
    // const [useResult, shareResult$] = bind(result$, options?.defaultValue || null);
    // return [setValue, useValue, useResult, shareResult$];

    const value$ = new Subject<T>();
    const setValue = (v: T) => value$.next(v);
    const useValue = () => useObservable(value$);
    let result$ = value$.pipe(
        // Only update when parameters changed
        // distinctUntilChanged((prev, curr) => {
        // 	// console.log('Prev', JSON.stringify(prev))
        // 	// console.log('Curr', JSON.stringify(curr))
        // 	return isEqual(JSON.stringify(prev), JSON.stringify(curr))
        // }),
        switchMap(toFetch)
    );
    if (_shareReplay) result$ = result$.pipe(shareReplay(1));
    const useResult = () => useObservable(result$, options?.defaultValue || null);
    return [setValue, useValue, useResult, result$];
}
/** To customize how to fetch the API */
export function createAPIFetchQuery<T extends {}, E = any>(endpoint: string, init?: RequestInit, defaultValue?: any) {
    return createAPIFetchCustom<T, ResponseFetch<E>>((val: T) => createAPIFetch(endpoint + queryString(val), init), {
        defaultValue,
    });
}

export const QueryError = ({ query }) => {
    return (query?.errors && query?.message) || '';
};

export const responseSelector = <T>(
    response: T,
    selector: (v: Exclude<T, APIFetchResponse | undefined | null>) => any
) => {
    const vv = responseValid<T>(response);
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
