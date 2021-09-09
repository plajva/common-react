import {} from '@common/utils';
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
export const responseIsValid = <T extends ResponseFetchAny>(v: T): ResponseFetchValid<T> | undefined =>
    v && !v.errors && !v.loading && !v.message && hasOwnProperty(v, 'data') ? v : undefined;
export const responseIsError = <T extends ResponseFetchAny>(v: T): ResponseFetchErrors<T> | undefined =>
    v && hasOwnProperty(v, 'errors') ? v : undefined;

type FetchOptions<T> = { init?: RequestInit; okReturn?: (res: Response) => Observable<T> };
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
                return (
                    okReturn
                        ? okReturn(res)
                        : content_type === 'application/json'
                        ? from(res.json())
                        : content_type === 'text/plain'
                        ? from(res.text())
                        : of(true)
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
    if (['test', 'development'].includes(process.env.NODE_ENV))
        o = o.pipe(
            map((v) => {
                console.log('FetchResponse: ', JSON.stringify(v, null, 2));
                return v;
            })
        );

    return o.pipe(startWith(fetchDefault));
};

export const createAPIFetchStatic = <R, D = undefined>(
    options: FetchHelperOptions<R>,
    defaultValue?: D
): [() => ResponseFetch<R> | D | undefined, Observable<ResponseFetch<R>>] => {
    const o = createAPIFetchHelper<R>(options).pipe(shareReplay(1));
    const useO = () => useObservable(o, defaultValue);
    return [useO, o];
};

/**
 * We have:
 *  createAPIFetchEvent
 *  createAPIFetchEventCombine
 *  createAPIFetchEvent
 */
type FetchEventOptions<D, C extends unknown[] = []> = {
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
export function createAPIFetchEvent<I, R, D = undefined, C extends unknown[] = []>(
    toFetch: (val: [I, ...C]) => Observable<R>,
    options?: FetchEventOptions<D, C> & { startWith?: I }
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
    options?: FetchEventOptions<D>
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
    endpoint: string;
    baseUrl?: string;
    query?: object;
    token?: string;
    auth?: string;
    body?: string | object;
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
        init = { ...init, body: typeof body === 'object' ? JSON.stringify(body) : body };
    }
    if (auth || token) {
        init = { ...init, headers: { ...init?.headers, Authorization: token ? `Bearer ${token}` : auth || '' } };
    }
    return createAPIFetch<T>({ url, init, ...others });
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
// type type = [{[key:string]:string}];
// type t = type[keyof type];
// combineInputs<>(v => {})
