// import { object_equals } from '@common/utils';
import { bind, SUSPENSE } from '@react-rxjs/core';
import { createSignal } from '@react-rxjs/utils';
// import {isEqual} from 'lodash';
import { catchError, distinctUntilChanged, Observable, of, shareReplay, switchMap } from 'rxjs';
import { fromFetch } from 'rxjs/fetch';


// ! This is to be moved out of common if it's to actually be 'common'
// Implementation error handling should not be common as different APIs return different error values
export interface APIFetchResponse {
    errors?: boolean | null;
    message?: string | null;
}

export const createAPIFetch = <T>(
    endpoint: string,
    init?: RequestInit,
    okReturn?: (res: Response) => Observable<T>
) => {
    // if(process.env.REACT_APP_API_HOST){
    //     // Add host if available
    //     init = {headers:{"Host":process.env.REACT_APP_API_HOST,...init?.headers},...init};
    // }
    
    if (endpoint[0] !== '/') endpoint = '/' + endpoint;
    if (!process.env.REACT_APP_API_URL) throw new Error(`process.env.REACT_APP_API_URL undefined?`);
    const url = `${process.env.REACT_APP_API_URL}${endpoint}`;
    return fromFetch(url, init).pipe(
        switchMap((res) => {
            if (res.ok) {
                return okReturn ? okReturn(res) : res.json();
            } else {
                return of({ errors: true, message: `Error ${res.status}` });
            }
        }),
        catchError((err) => {
            console.error(err);
            return of({ errors: true, message: err.message });
        })
    ) as Observable<T>;
};
// ! ---------------------------------

export const createAPIFetchStatic = <T>(endpoint: string, init?: RequestInit, defaultValue?: any) =>
    bind<T>(createAPIFetch<T>(endpoint, init).pipe(shareReplay(1)), defaultValue || null);

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
export function createAPIFetchCustom<T extends {}, E = any>(
    toFetch: (val: T) => Observable<E>,
    defaultValue?: any
): [(v: T) => void, () => Exclude<T, typeof SUSPENSE> | null,() => Exclude<E, typeof SUSPENSE> | null, Observable<E>] {
    const [value$, setValue] = createSignal<T>(); 
    const [useValue, valueShare$] = bind(value$, null);
    const result$ = value$.pipe(
        // Only update when parameters changed
        // distinctUntilChanged((prev, curr) => {
				// 	// console.log('Prev', JSON.stringify(prev))
				// 	// console.log('Curr', JSON.stringify(curr))
				// 	return isEqual(JSON.stringify(prev), JSON.stringify(curr))
				// }),
        switchMap(toFetch),
        shareReplay(1)
    );
    const [useResult, shareResult$] = bind(result$, defaultValue || null);
    return [setValue, useValue, useResult, shareResult$];
}
/** To customize how to fetch the API */
export function createAPIFetchQuery<T extends {}, E = any>(endpoint: string, init?: RequestInit, defaultValue?: any) {
    return createAPIFetchCustom<T, E>((val: T) => createAPIFetch(endpoint + queryString(val), init), defaultValue);
}

export const QueryError = ({ query }) => {
    return (query?.errors && query?.message) || '';
};
