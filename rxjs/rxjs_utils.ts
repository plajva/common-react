import { pruneEmpty } from '@common/utils';
import { useEffect, useState } from 'react';
import {
    catchError,
    combineLatest,
    from,
    map,
    Observable,
    ObservableInputTuple,
    of,
    shareReplay,
    startWith,
    Subject,
    switchMap,
} from 'rxjs';
import { fromFetch } from 'rxjs/fetch';

export interface ResponseFetch<T> {
    errors?: boolean;
    message?: string;
    loading?: boolean;
    data?: T;
}
// type Test = ResponseFetchValid<ResponseFetch<{id:string} | undefined>>;
type ResponseFetchAny = ResponseFetch<any> | undefined | null;
type Define<T> = Exclude<T, undefined | null>;
export type ResponseFetchValid<T extends ResponseFetchAny> = Required<Pick<Define<T>, 'data'>>;
export type ResponseFetchErrors<T extends ResponseFetchAny> = Required<Pick<Define<T>, 'errors'>> &
    Pick<Define<T>, 'message'>;

export const QueryError = ({ query }) => {
    return (query?.errors && query?.message) || '';
};

export const responseSelector = <T>(response: T, selector: (v: ResponseFetchValid<T>) => any) => {
    const vv = responseIsValid<T>(response);
    if (vv) {
        return selector(vv);
    }
};

export const useObservable = <T, D = undefined>(observable: Observable<T>, defaultValue: D) => {
    const [state, setState] = useState<T | D>(defaultValue);

    useEffect(() => {
        const sub = observable.subscribe(setState);
        return () => sub.unsubscribe();
    }, [observable]);

    return state;
};
/**
 * You can use this function IF and only IF onEvent uses references/values that won't change
 *
 * MEANING, ALWAYS USE setState(val => ...)
 *
 * THIS FUNCTION/useEffect WILL NOT UPDATE WHEN onEvent changes
 * @param observable
 * @param onEvent
 * @param enabled pass a boolean to indicate wether to have this event enabled
 */
export const useObserableEvent = <T>(observable: Observable<T>, onEvent: (v: T) => void, enabled?: boolean) => {
    useEffect(() => {
        if (enabled ?? true) {
            const sub = observable.subscribe(onEvent);
            return () => sub.unsubscribe();
        }
    }, [observable, enabled]);
};
// From https://fettblog.eu/typescript-hasownproperty/
function hasOwnProperty<X extends {}, Y extends PropertyKey>(obj: X, prop: Y): obj is X & Record<Y, unknown> {
    return obj.hasOwnProperty(prop);
}
// --------------
/** Will only be true if response is valid && non-null  */
export const responseIsValid = <T extends ResponseFetchAny>(v: T): ResponseFetchValid<T> | undefined =>
    v && !v.errors && !v.loading && !v.message && hasOwnProperty(v, 'data') ? v : undefined;
/** Will only be true if response is of type error && non-null  */
export const responseIsError = <T extends ResponseFetchAny>(v: T): ResponseFetchErrors<T> | undefined =>
    v && hasOwnProperty(v, 'errors') ? v : undefined;

type FetchOptions<T> = {
    /** Init to use, will take precedence over all other options */
    init?: RequestInit;
    /** When request succedes, what to do with value?, by default a json will be converted to object, and text to a string */
    okReturn?: (value: any) => T;
};
const fetchDefault: ResponseFetch<any> = { loading: true, data: undefined };
export const createAPIFetch = <T>({
    url,
    init,
    okReturn,
}: { url: string } & FetchOptions<T>): Observable<ResponseFetch<T>> => {
    let o = fromFetch(url, init).pipe(
        switchMap((res) => {
            // The .split is to handle content types like 'application/json; charset=utf-8'
            let content_type = res.headers.get('Content-type')?.split(';')[0];
            
            // let content_size = res.headers.get
            if (res.ok) {
                const r = content_type === 'application/json'
                ? from(res.json())
                : content_type === 'text/plain'
                ? from(res.text())
                : of(true);
                
                return (
                    okReturn ? (r.pipe(map(okReturn))) : r
                ).pipe(map((v) => ({ data: v })));
            } else {
                switch (content_type) {
                    case 'application/json':
                        return from(res.json()).pipe(
                            map((v) => ({
                                errors: true,
                                message: v
                                    ? (v?.errors &&
                                          (typeof v.errors === 'boolean'
                                              ? String(v?.message)
                                              : JSON.stringify(v.errors))) ||
                                      JSON.stringify(v)
                                    : `Error ${res.status}`,
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
        })
    );
    // Logs all data if in development
    // if (['test', 'development'].includes(process.env.NODE_ENV))
    //     o = o.pipe(
    //         map((v) => {
    //             console.log('FetchResponse: ', JSON.stringify(v, null, 2));
    //             return v;
    //         })
    //     );

    return o.pipe(startWith(fetchDefault));
};

export const createAPIFetchStatic = <R, C extends unknown[], D = undefined>(
    foptions: FetchHelperOptions<R>,
    options?: FetchEventOptions<ResponseFetch<R>, D, C>
): [() => ResponseFetch<R> | D | undefined, Observable<ResponseFetch<R>>] => {
    const combineValid$ = options?.combine$ ?? ([of(null)] as unknown as [...ObservableInputTuple<C>]);
    const [useV, useR, result$] = createAPIFetchChain(
        combineValid$,
        (s) => createAPIFetchHelperCall(s, foptions),
        options
    );
    return [useR, result$];
};

/**
 * We have:
 *  createAPIFetchEvent
 *  createAPIFetchEventCombine
 *  createAPIFetchEvent
 */
type FetchEventOptions<R, D, C extends unknown[]> = {
    responseType?: R;
    defaultValue?: D;
    shareReplay?: boolean;
    combine$?: [...ObservableInputTuple<C>];
};
/**
 * Creates event and chains with other events/obserables, then turns into something usable by React
 * @type I: Input Type
 * @type R: Response Type
 * @type D: Default Value Type
 * @type C: Combine Type
 * */
export function createAPIFetchEvent<I, R, C extends unknown[], D = undefined>(
    toFetch: (val: [I, ...C]) => Observable<R>,
    options?: FetchEventOptions<R, D, C> & { startWith?: I; inputType?: I }
): [(v: I) => void, () => [I, ...C] | undefined, () => R | D | undefined, Observable<R>] {
    // Making a subject, a new event creator per say
    // Subject will usually have queryString or
    const subject$ = new Subject<I>();
    const setValue = (v: I) => subject$.next(v);
    const subjectO$ = options?.startWith ? subject$.pipe(startWith(options.startWith)) : subject$;
    // Binding an obserable to events/obserables
    const chain$ = (
        options?.combine$
            ? combineLatest<[I, ...C]>([subjectO$, ...options?.combine$])
            : subjectO$.pipe(map((v): [I] => [v]))
    ) as Observable<[I, ...C]>;
    const useValue = () => useObservable<[I, ...C]>(chain$, undefined);
    // Map event to fetch
    let result$ = chain$.pipe(switchMap(toFetch));
    // Replay the result
    if (options?.shareReplay ?? true) result$ = result$.pipe(shareReplay(1));
    // Bind to result
    const useResult = () => useObservable(result$, options?.defaultValue);
    // Return
    return [setValue, useValue, useResult, result$];
}
/**
 * Chains with other events/obserables, then turns into something usable by React
 * @type R: Response Type
 * @type D: Default Value Type
 * @type C: Combine Type
 * */
export function createAPIFetchChain<R, D = undefined, C extends unknown[] = []>(
    combine$: [...ObservableInputTuple<C>],
    toFetch: (val: [...C]) => Observable<R>,
    options?:  FetchEventOptions<R, D, C> 
): [() => [...C] | undefined, () => R | D | undefined, Observable<R>] {
    const _shareReplay = options?.shareReplay ?? true;

    const chain$ = combineLatest<[...C]>([...combine$]);
    // Binding an obserable to event created
    const useValue = () => useObservable(chain$, undefined);
    // Map event to fetch
    let result$ = chain$.pipe(switchMap(toFetch));
    // Replay the result
    if (_shareReplay) result$ = result$.pipe(shareReplay(1));
    // Bind to result
    const useResult = () => useObservable(result$, options?.defaultValue);
    // Return
    return [useValue, useResult, result$];
}

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
type FetchHelperOptions<T> = {
    /** The endpoint string to use */
    endpoint: string;
    /** The baseUrl to be used for query URL generation, will be postfixed by 'endpoint' */
    baseUrl?: string;
    /** The query object to use => ? k=v & k=v */
    query?: object;
    /** The token to use for Authentication header, will be prefixed by 'Bearer ' */
    token?: string;
    /** The value of Authentication header, will replace 'token' option */
    auth?: string;
    /** The body, will be converted JSON string if object */
    body?: string | object;
    /** 'json': will set method to POST and content type to json */
    type?: 'json';
} & FetchOptions<T>;
/**
 * Another method of createAPIFetch
 * @param param0 Options to create query
 * @returns
 */
export const createAPIFetchHelper = <T>({
    endpoint,
    baseUrl,
    init: _init,
    query,
    token,
    auth,
    body,
    type,
    ...others
}: FetchHelperOptions<T>) => {
    if (endpoint[0] !== '/') endpoint = '/' + endpoint;
    if (!process.env.REACT_APP_API_URL && !baseUrl) throw new Error(`process.env.REACT_APP_API_URL undefined?`);
    const url = `${baseUrl ?? process.env.REACT_APP_API_URL}${endpoint + (query ? queryString(query) : '')}`;

    let init = _init ?? {};
    switch (type) {
        case 'json':
            init = { method: 'POST', ...init, headers: { 'Content-Type': 'application/json', ...init?.headers } };
            break;
    }
    if (body) {
        init = { ...init, body: typeof body === 'object' ? JSON.stringify(pruneEmpty(body)) : body };
    }
    if (auth || token) {
        init = { ...init, headers: { ...init?.headers, Authorization: token ? `Bearer ${token}` : auth || '' } };
    }
    return createAPIFetch<T>({ url, init, ...others });
};

export type HelperInputTouple<T> = {
    [K in keyof T]: T[K];
};
export type HelperTransformTouple<T, R> = {
    [K in keyof T]?: (v: T[K]) => Partial<FetchHelperOptions<R>>;
};
export const createAPIFetchHelperCombine = <R, A extends unknown[]>(
    sources: [...HelperInputTouple<A>],
    ...transform: [...HelperTransformTouple<A, R>]
) => {
    const transformed = sources.map((s, i) => {
        const t = transform[i];
        return t ? t(s) : (s as FetchHelperOptions<R>);
    });
    const combined = transformed.reduce((a, v) => Object.assign(a, v), {} as FetchHelperOptions<R>);
    return combined;
};
/**
 * An interface to map values, takes in array of values and transform array respectively, returns call to createApiFetchHelper of all transform objects combined
 * @param sources
 * @param transform
 */
export const createAPIFetchHelperCall = <R, A extends unknown[]>(
    sources: [...HelperInputTouple<A>],
    options: FetchHelperOptions<R>,
    ...transform: [...HelperTransformTouple<A, R>]
) => {
    return createAPIFetchHelper<R>({ ...options, ...createAPIFetchHelperCombine(sources, ...transform) });
};

/**
 * Converts input array into an object, and executes toCall with that object
 * @param toCall function to call after input array converted to object
 * @returns (array) => toCall return type
 */
export const combineInputs =
    <I extends any[], O = any>(toCall: (v: I[keyof I]) => O) =>
    (v: I) =>
        toCall(
            Object.values(v).reduce((a, v) => {
                if (typeof v === 'object' && !Array.isArray(v)) for (var key in v) a[key] = v[key];
                return a;
            }, {})
        );
