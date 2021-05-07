import React, { ReactNode, SetStateAction, useState } from 'react';

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
  return (...e) => {
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

export function stringAppend(v?: string, v2?: string) {
  return (v ? v : '') + (v2 ? v2 : '');
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

/**
 * For components that separate first children for some things, and the rest, children can be functions that take the state and setState parameters
 * @param children The children
 * @param state component state
 * @param setState component setState
 */
export const separateChildren = (
  children,
  state = {},
  setState: any = () => {}
): [ReactNode, ReactNode, (c: ReactNode) => ReactNode] => {
  const _children = Array.isArray(children) ? [...children] : [children];
  let child_first;
  if (_children.length) {
    child_first = _children.splice(0, 1);
  }
  const child_rest = _children;
  const renderChild = (child) => {
    const _render = (v) => (typeof v === 'function' ? v(state, setState) : v);
    return Array.isArray(child) ? child.map((v) => _render(v)) : _render(child);
  };
  return [child_first, child_rest, renderChild];
};

/**
 * If you want to set the default values for an object, same as {Object.assign(defaults, v)}
 * @param v input object
 * @param defaults set if unset
 */
export const setObjectDefault = <T>(v: T, defaults: Partial<T>): T => {
  return Object.assign(defaults, v);
};

/**
 * If you want to set the default values for a variable, same as {typeof v === 'undefined' ? d : v}
 * @param v input object
 * @param d set if unset
 */
export const setDefault = <T>(v: T | undefined, d: T): T => {
  return typeof v === 'undefined' ? d : v;
};

/**
 * Will filter array when an item matches another with the same criteria
 * @param v The array to filter
 * @param criteria A string 'property_name;name.first;name.last'
 */
export const removeDuplicates = <T>(v: T[], criteria: string): T[] => {
  if (!Array.isArray(v)) {
    console.warn(`V is not array: '${v}'`);
    return v;
  }
  return v.reduce((a, v) => {
    if (
      !criteria.split(';').every((p) => {
        const pa = p.split('.').map((p) => p.trim()); // Resolve dots in params
        const paf = (v) => pa.reduce((a, v) => (a ? a[v] : a), v);
        return a.find((av) => paf(av) === paf(v));
      })
    )
      a.push(v);
    return a;
  }, [] as T[]);
};

export const debounceCreator = <T extends Function>(callback: T, wait: number = 0) => {
  let timeout: NodeJS.Timeout;
  return (...args) => {
    const context = this;
    clearTimeout(timeout);
    if (wait > 0) {
      timeout = setTimeout(() => callback.apply(context, args), wait);
    } else {
      callback.apply(context, args);
    }
  };
};
