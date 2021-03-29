import { SetStateAction, useState } from 'react';

export type Range = [number | undefined, number | undefined];

export interface AtomProps {
    className?: string;
}

/**
 *
 * @param s The module stylesheet
 * @param classNames All the classnames to parse, pass 'dup' to toggle duplication, starts disabled false
 */
export function classNameFind(s: any, ...classNames: (string | undefined)[]) {
    let dup = false;
    // const filter = (c?:string) => c;
    return classNames?.length
        ? classNames
              .filter((c) => c)
              .join(' ')
              .split(' ')
              .map((c) => {
                  if (c === 'dup') {
                      dup = !dup;
                      return '';
                  }
                  return s[c] ? s[c] + (dup ? ' ' + c : '') : c;
              })
              .filter((c) => c)
              .join(' ')
        : '';
}

export function combineEvent(...functions: any[]) {
    return (...e: any[]) => {
        functions.forEach((f) => {
            if (typeof f === 'function') f(...e);
        });
    };
}

// function debounce(fn, ms) {
//   let timer;
//   return _ => {
//     clearTimeout(timer)
//     timer = setTimeout(_ => {
//       timer = null
//       fn.apply(this, arguments)
//     }, ms)
//   };
// }

export function stringAppend(value?: string, ovalue?: string) {
    return (value ? value : '') + (ovalue ? ovalue : '');
}

/**
 * Combines objects, last
 * @param mprops All props
 */
export function combineProps(...mprops: object[]) {}

/**
 * Combine state
 */
export const combineState = <T>(
    useS: [T, React.Dispatch<React.SetStateAction<T>>],
    state?: T,
    setState?: React.Dispatch<React.SetStateAction<T>>
): [T, React.Dispatch<React.SetStateAction<T>>] => {
    let [s, ss] = useS;
    if (typeof state !== 'undefined') s = state;
    if (setState)
        ss = (v: SetStateAction<T>) => {
            ss(v);
            setState(v);
        };
    return [s, ss];
};
