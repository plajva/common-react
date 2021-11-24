import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { combineEvent, deepMerge, jwtParse, RecursivePartial } from './utils';

const getValidState = (ownState, upState) => {
	return typeof ownState === 'object'
		? deepMerge(ownState, upState)
		: typeof upState !== 'undefined'
		? upState
		: ownState;
};
/**
 * Combine incoming state into new state.
 * This helper function takes in incoming state from
 * component props and tries to handle upwards state change
 * by modifyfing setState to upState if valid, or ownState
 * @param defaultState The default state if no incoming state
 */
export const useStateCombine = <T>(
	defaultState: T,
	upState?: T,
	upSetState?: React.Dispatch<React.SetStateAction<T>>
): [T, React.Dispatch<React.SetStateAction<T>>] => {
	// If state is object then deep merge object, else then either take upState or default state
	let [s, ss] = useState(getValidState(defaultState, upState));
	return [getValidState(s, upState), combineEvent(upSetState, upState ? undefined : ss)];
};

// Like useState but will merge when setState called, if u need to use object states in function components
export const useStateObject = <T extends object>(
	d: T
): [T, React.Dispatch<React.SetStateAction<RecursivePartial<T>>>] => {
	const [state, _setState] = useState(d);
	const setState = (sn: React.SetStateAction<RecursivePartial<T>>) =>
		_setState((s) => {
			return typeof sn === 'function' ? sn(s) : { ...deepMerge(s, sn) };
		});
	return [state, setState];
};

/**
 * For components that separate first children for some things, and the rest, children can be functions that take the state and setState parameters
 * @param children The children
 * @param state component state
 * @param setState component setState
 */
export const separateChildren = (
	children: ReactNode,
	state = {},
	setState: any = () => {}
): [
	ReactNode | undefined,
	(React.ReactChild | React.ReactFragment | React.ReactPortal)[],
	(c: ReactNode) => ReactNode
] => {
	const _children = React.Children.toArray(children);
	let child_first: typeof _children[0] | undefined;
	if (_children.length) {
		child_first = _children.shift();
	}
	const child_rest = _children;
	const renderChild = (child: any) => {
		const _render = (v: any) => (typeof v === 'function' ? v(state, setState) : v);
		return Array.isArray(child) ? child.map((v) => _render(v)) : _render(child);
	};
	return [child_first, child_rest, renderChild];
};

export const scrollToElement = (
	el: HTMLElement | null,
	{ offset, scrollView }: { offset?: number; scrollView?: ScrollIntoViewOptions | boolean }
) => {
	if (el) {
		if (scrollView) {
			el.scrollIntoView({
				block: 'start',
				behavior: 'smooth',
				...(typeof scrollView === 'object' ? scrollView : {}),
			});
		} else {
			const y = (el.getBoundingClientRect().top || 0) + window.pageYOffset + (offset || 0);
			window.scrollTo({ top: y, behavior: 'smooth' });
		}
	}
};

export const isLogin = (_token?: string) => {
	const token = _token ?? localStorage.getItem('token');
	if (token) {
		const jwt = jwtParse(token);
		if (jwt) {
			const exp = new Date(Number(jwt.exp) * 1000);
			const expired = new Date().getTime() > exp.getTime();
			return !expired;
		}
	}
	return false;
};


export function useInterval(callback, {delay, onStart}) {
  const savedCallback = useRef<any>();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current?.();
    }
    if (delay !== null) {
			if(onStart)tick();
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}