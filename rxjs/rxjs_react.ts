import { useEffect, useState } from 'react';
import { Observable, Subscription } from 'rxjs'

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