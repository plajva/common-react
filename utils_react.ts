import React, { ReactNode, SetStateAction, useState } from 'react';
import { deepMerge, RecursivePartial } from './utils';

/**
 * Combine incoming state into new state.
 * This helper function takes in incoming state from
 * component props and tries to handle upwards state change
 * by modifyfing setState to set both local and upwards setState
 * @param defaultState The default state if no incoming state
 */
export const useStateCombine = <T>(
    defaultState: T,
    upState?: T,
    upSetState?: React.Dispatch<React.SetStateAction<T>>
): [T, React.Dispatch<React.SetStateAction<T>>] => {
    // If state is object then deep merge object, else then either take upState or default state
    let [s, ss] = useState(
        typeof defaultState === 'object' ? deepMerge(defaultState, upState) : upState ? upState : defaultState
    );
    // Call both setState functions
    if (upSetState)
        ss = (v: SetStateAction<T>) => {
            ss(v);
            upSetState(v);
        };
    return [s, ss];
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
    children: any,
    state = {},
    setState: any = () => {}
): [ReactNode, ReactNode, (c: ReactNode) => ReactNode] => {
    const _children = Array.isArray(children) ? [...children] : [children];
    let child_first;
    if (_children.length) {
        child_first = _children.splice(0, 1);
    }
    const child_rest = _children;
    const renderChild = (child: any) => {
        const _render = (v: any) => (typeof v === 'function' ? v(state, setState) : v);
        return Array.isArray(child) ? child.map((v) => _render(v)) : _render(child);
    };
    return [child_first, child_rest, renderChild];
};
