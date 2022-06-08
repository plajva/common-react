import { pruneEmpty } from '@common/utils';
import { useEffect, useState } from 'react';
import {
	catchError,
	combineLatest,
	distinctUntilChanged,
	filter,
	from,
	map,
	Observable,
	ObservableInputTuple,
	of,
	share,
	shareReplay,
	startWith,
	Subject,
	Subscription,
	switchMap,
	take,
	timeout,
	withLatestFrom,
} from 'rxjs';
import { fromFetch } from 'rxjs/fetch';

export interface ResponseFetch<T = any> {
	errors?: boolean;
	message?: string;
	loading?: boolean;
	data?: T;
	res?: Response;
}
// type Test = ResponseFetchValid<ResponseFetch<{id:string} | undefined>>;
export type ResponseFetchAny = ResponseFetch<any> | undefined | null;
type Define<T> = Exclude<T, undefined | null>;
export type ResponseFetchValid<T extends ResponseFetchAny> = Required<Pick<Define<T>, 'data'>>;
export type ResponseFetchErrors<T extends ResponseFetchAny> = Required<Pick<Define<T>, 'errors'>> &
	Pick<Define<T>, 'message'>;

export const QueryError = ({ query }) => {
	return (query?.errors && query?.message) || '';
};

/** Use this function to listen an obserable in a React Component */
export const useObservable = <T, D = undefined>(observable: Observable<T>, defaultValue: D) => {
	const [state, setState] = useState<T | D>(defaultValue);

	useEffect(() => {
		const sub = observable.subscribe(setState);
		return () => sub.unsubscribe();
	}, [observable]);

	return state;
};

/** Use this function to listen to an observables object with {key:string, value: obserable} in a React Component */
export const useObservableObject = <T>(os: { [k: string]: Observable<T> } | undefined) => {
	const [state, setState] = useState<{ [k: string]: T }>({});

	useEffect(() => {
		if (!os) return;
		const sub = Object.entries(os).reduce((a, [k, v]) => {
			a[k] = v.subscribe((vs) =>
				setState((s) => {
					s[k] = vs;
					return { ...s };
				})
			);
			return a;
		}, {} as { [k: string]: Subscription });
		// const sub = os.subscribe(setState);
		return () => Object.entries(sub).forEach(([k, v]) => v.unsubscribe());
	}, [os]);

	return state;
};

export const fetchEventsAll = new Subject<ResponseFetchAny>();

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
export const toTrigger = (v: Observable<any>) =>
	v.pipe(
		map((v) => undefined),
		startWith(undefined)
	);
export const toValid = <R extends ResponseFetchAny>(v: Observable<R>) =>
	v.pipe(filter((v) => !!responseIsValid<R>(v))) as Observable<ResponseFetchValid<R>>;
export const toValidTrigger = (v) => toTrigger(toValid(v))
/** Will only be true if response is valid && non-null  */
export const responseIsValid = <T extends ResponseFetchAny>(v: T): ResponseFetchValid<T> | undefined =>
	v && !v.errors && !v.loading && !v.message && hasOwnProperty(v, 'data') ? v : undefined;
/** Will only be true if response is of type error && non-null  */
export const responseIsError = <T extends ResponseFetchAny>(v: T): ResponseFetchErrors<T> | undefined =>
	v && hasOwnProperty(v, 'errors') ? v : undefined;

type FetchOptions<T = any> = {
	/** Init to use, will take precedence over all other options */
	init?: RequestInit;
	force?: 'text' | 'arrayBuffer' | 'formData' | 'json' | 'blob';
	/** When request succedes, what to do with value?, by default a json will be converted to object, and text to a string */
	okReturn?: (value: T) => T;
};
const fetchDefault: ResponseFetch<any> = { loading: true, data: undefined };
export const createAPIFetch = <T>({
	url,
	init,
	force,
	okReturn,
}: { url: string } & FetchOptions<T>): Observable<ResponseFetch<T>> => {
	let o = fromFetch(url, init).pipe(
		switchMap((res) => {
			// The .split is to handle content types like 'application/json; charset=utf-8'
			let content_type = res.headers.get('Content-type')?.split(';')[0];

			// let content_size = res.headers.get
			if (res.ok) {
				const r = from(
					force
						? force === 'blob'
							? res.blob()
							: force === 'json'
							? res.json()
							: force === 'arrayBuffer'
							? res.arrayBuffer()
							: force === 'formData'
							? res.formData()
							: res.text()
						: content_type
						? content_type === 'application/json'
							? res.json()
							: content_type.includes('text/')
							? res.text()
							: res.blob()
						: res.text()
				).pipe(map((v) => ({ data: v, res })));

				return okReturn
					? r.pipe(
							map((d) => {
								d.data = okReturn(d.data);
								return d;
							})
					  )
					: r;
			} else {
				switch (content_type) {
					case 'application/json':
						return from(res.json()).pipe(
							map((v) => ({
								errors: true,
								message: v
									? v?.message ?? v?.Message ?? JSON.stringify(v.errors)
									: `Error: ${res.status} - ${res.statusText}`,
							}))
						);
					case 'text/plain':
						return from(res.text()).pipe(map((v) => ({ errors: true, message: String(v) || `Error ${res.status}` })));
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

export const createAPIFetchStatic = <R, C extends unknown[], W extends unknown[], D = undefined>(
	foptions: FetchHelperOptions<R>,
	options?: FetchEventOptions<ResponseFetch<R>, D, C, W>
): [() => ResponseFetch<R> | D | undefined, Observable<ResponseFetch<R>>] => {
	// Set default [of(null)] observable array if no combine$ is
	const combineValid$ = options?.combineLatest$ ?? ([of(null)] as unknown as [...ObservableInputTuple<C>]);
	const [useV, useR, result$] = createAPIFetchChain(
		combineValid$,
		//@ts-ignore
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
type FetchEventOptions<R, D, C extends unknown[], W extends unknown[], I = undefined> = {
	responseType?: R;
	defaultValue?: D;
	/** Pipe input with operator, default 'undefined' */
	inputPipe?: ((v: Observable<I>) => Observable<I>) | 'distinct';
	/** Pipe result with operator, default 'shareReplay' */
	responsePipe?: ((v: Observable<R>) => Observable<R>) | 'share' | 'shareReplay' | 'shareReplayRefcount' | false;
	/**
	 * Combine with other observables,
	 * needs at least 1 value, will retrigger on any new value by any combine observable
	 */
	combineLatest$?: [...ObservableInputTuple<C>];
	/**
	 * Combine with other observables,
	 * needs at least 1 value, will NOT retrigger on any new value by these observables
	 */
	withLatestFrom$?: [...ObservableInputTuple<W>];
};
const logFetch = !!process.env.REACT_APP_DEBUG_FETCH;

/** Fixing ->   Type 'T & Function' has no call signatures.  when setting value with a function*/
type InputUnion<I> = I | ((v: I) => I);
/**
 * Creates event and chains with other events/obserables, then turns into something usable by React
 * @type I: Input Type
 * @type R: Response Type
 * @type D: Default Value Type
 * @type C: Combine Type
 * */
export function createAPIFetchEvent<
	I extends Exclude<any, Function>,
	R,
	C extends unknown[],
	W extends unknown[],
	D = undefined
>(
	toFetch: (val: [I, ...C, ...W]) => Observable<R>,
	options?: FetchEventOptions<R, D, C, W, I> & { startWith?: I; inputType?: I }
): [(v: InputUnion<I>) => void, () => [I, ...C, ...W] | undefined, () => R | D | undefined, Observable<R>] {
	// Making a subject, a new event creator per say
	// Subject will usually have queryString or
	let subject$ = new Subject<I>();
	let subjectO$ = options?.startWith ? subject$.pipe(startWith(options.startWith)) : subject$;
	const inputPipe = options?.inputPipe;
	if (inputPipe) subjectO$ = subjectO$.pipe(inputPipe === 'distinct' ? distinctUntilChanged() : inputPipe);

	const subjectOHot$ = subjectO$.pipe(shareReplay(1));
	/** If v is function, will wait from value from */
	const setValue = (v: InputUnion<I>) => {
		if (logFetch) console.log('Next started: ', v, ' observed: ', subject$.observed);
		typeof v === 'function'
			? subjectOHot$.pipe(take(1), timeout(1000)).subscribe((p) => subject$.next((v as Function)(p)))
			: subject$.next(v);
	};

	// Binding an obserable to events/obserables
	const chain_$ = (
		options?.combineLatest$
			? combineLatest<[I, ...C]>([subjectO$, ...options?.combineLatest$])
			: subjectO$.pipe(map((v): [I] => [v]))
	) as Observable<[I, ...C]>;
	// Binding the chain to withLatest from
	let chain$ = (
		options?.withLatestFrom$
			? chain_$.pipe(
					withLatestFrom(...options.withLatestFrom$),
					// WithLatest from to the values we want
					map(([f, ...o]) => [...f, ...o])
			  )
			: chain_$
	) as Observable<[I, ...C, ...W]>;

	const useValue = () => useObservable(chain$, undefined);
	// Map event to fetch
	if (logFetch)
		chain$ = chain$.pipe(
			map((v) => {
				console.log('Fetch event has:', v);
				return v;
			})
		);
	let result$ = chain$.pipe(switchMap(toFetch));
	// Make any event trigger all events global Subject
	result$ = result$.pipe(
		map((v) => {
			fetchEventsAll.next(v);
			return v;
		})
	);
	// Pipe the result
	const resultPipe = options?.responsePipe ?? 'shareReplay';
	if (resultPipe)
		result$ = result$.pipe(
			resultPipe === 'shareReplay'
				? shareReplay(1)
				: resultPipe === 'shareReplayRefcount'
				? shareReplay({ bufferSize: 1, refCount: true })
				: resultPipe === 'share'
				? share()
				: resultPipe
		);
	// Bind to result
	const useResult = () => useObservable(result$, options?.defaultValue);
	// Return
	return [setValue, useValue, useResult, result$];
}
/**
 * Chains with other events/obserables, then turns into something usable by React
 * Replaces combineLatest$ option with combine$ (making it required), also uses withLatestFrom$ if present
 * @type R: Response Type
 * @type D: Default Value Type
 * @type C: Combine Type
 * */
export function createAPIFetchChain<R, D = undefined, C extends unknown[] = [], W extends unknown[] = []>(
	combine$: [...ObservableInputTuple<C>],
	toFetch: (val: [...C, ...W]) => Observable<R>,
	options?: FetchEventOptions<R, D, C, W>
): [() => [...C, ...W] | undefined, () => R | D | undefined, Observable<R>] {
	// const _shareReplay = options?.shareReplay ?? true;

	const chain_$ = combineLatest<[...C]>([...combine$]);
	const chain$ = (
		options?.withLatestFrom$
			? chain_$.pipe(
					withLatestFrom(...options.withLatestFrom$),
					map(([f, ...o]) => [...f, ...o])
			  )
			: chain_$
	) as Observable<[...C, ...W]>;
	// Binding an obserable to event created
	const useValue = () => useObservable(chain$, undefined);
	// Map event to fetch
	let result$ = chain$.pipe(switchMap(toFetch));
	// Make any event trigger all events global Subject
	result$ = result$.pipe(
		map((v) => {
			fetchEventsAll.next(v);
			return v;
		})
	);

	// Pipe the result
	const resultPipe = options?.responsePipe ?? 'shareReplay';
	if (resultPipe)
		result$ = result$.pipe(
			resultPipe === 'shareReplay'
				? shareReplay(1)
				: resultPipe === 'shareReplayRefcount'
				? shareReplay({ bufferSize: 1, refCount: true })
				: resultPipe === 'share'
				? share()
				: resultPipe
		);
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
			Object.entries(pruneEmpty(v))
				.map(([k, v]) => `${k}=${v}`)
				.join('&')
		);
	}
};
export type FetchHelperOptions<T = any> = {
	/** The endpoint string to use */
	endpoint: string;
	/** The baseUrl to be used for query URL generation, will be postfixed by 'endpoint' */
	baseUrl?: string;
	/** The query object to use => ? k=v & k=v */
	query?: object;
	/** The token to use for Authentication header, will be prefixed by 'Bearer ' */
	token?: string | false;
	/** The value of Authentication header, will replace 'token' option */
	auth?: string;
	/** The body, will be pruned of empty values and converted to JSON string if object */
	body?: BodyInit | object;
	/** If false, body won't be pruned, overriten by bodyRaw */
	bodyPrune?: boolean;
	/** If true, body won't be pruned or converted, but will be passed to fetch exactly as is */
	bodyRaw?: boolean;
	/** 'json': will set method to POST and content type to json */
	type?: 'json';
} & FetchOptions<T>;

export const baseURLApi = process.env.REACT_APP_API_URL;
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
	bodyPrune,
	bodyRaw,
	auth,
	body,
	type,
	...others
}: FetchHelperOptions<T>) => {
	if (endpoint[0] !== '/') endpoint = '/' + endpoint;
	if (!baseURLApi && !baseUrl) throw new Error(`baseURLApi undefined?`);
	const url = `${baseUrl ?? baseURLApi}${endpoint + (query ? queryString(query) : '')}`;

	let init = _init ?? {};
	switch (type) {
		case 'json':
			init = { method: 'POST', ...init, headers: { 'Content-Type': 'application/json', ...init?.headers } };
			break;
	}
	if (body) {
		init = {
			...init,
			body:
				typeof body === 'object' && !bodyRaw
					? JSON.stringify(!bodyPrune ? body : pruneEmpty(body))
					: (body as BodyInit),
		};
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
	const combined = transformed.reduce(
		(a, v) => (typeof v === 'object' ? Object.assign(a, v) : a),
		{} as FetchHelperOptions<R>
	);
	return combined;
};
/**
 * An interface to map values, takes in array of values and transform array respectively, returns call to createApiFetchHelper of all transformed values
 * @example createAPIFetchHelperCall (
 * 		s: an array of input values,
 * 		options: default fetch options {endpoint: "/example_endpoint"}
 * 		...transformations: (s[0]) => null, (s[1]) => {endpoint:'//'}
 * )
 *
 * Note: Transformation objects will override previous transformations
 * Note: Undefined transformations will be used from input as is, so don't be scared to leave them empty
 *
 * @param sources
 * @param transform
 */
export const createAPIFetchHelperCall = <R, A extends unknown[]>(
	sources: [...HelperInputTouple<A>],
	options: FetchHelperOptions<R>,
	...transform: [...HelperTransformTouple<A, R>]
) => createAPIFetchHelper<R>({ ...options, ...createAPIFetchHelperCombine(sources, ...transform) });

// export const createAPIFetchHelperCallWithErrors = <R, A extends unknown[]>(
// 	sources: [...HelperInputTouple<A>],
// 	options: FetchHelperOptions<R>,
// 	...transform: [...HelperTransformTouple<A, R>]
// ) => createAPIFetchHelper<R>({ ...options, ...createAPIFetchHelperCombine(sources, ...transform) });

/**
 * Converts input array into an object, and executes toCall with that object
 ** Would convert [{a:1},{b:2}] -> {a:1,b:2}
 * @param toCall function to call after input array converted to object
 * @returns d(array) => toCall return type
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
