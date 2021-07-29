export type Range = [number | undefined, number | undefined];
export * from './utils_react';

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
export function deepMerge(target: any, ...sources: any[]): any {
    if (!sources?.length) return target;
    const source = sources.shift();
    const isObject = (v: any) => {
        return v && typeof v === 'object' && !Array.isArray(v);
    };

    if (isObject(target) && isObject(source)) {
        // So both of them must be objects at this point
        for (const key in source) {
            if (isObject(source[key])) {
                // Create object in a if
                if (!target[key]) Object.assign(target, { [key]: {} });
                deepMerge(target[key], source[key]);
            } else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }
    return deepMerge(target, ...sources);
}

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
 * Ex "criteria:'name;name.first'" compares a.name===b.name and a.name.first===b.name.first
 * @param v The array to filter
 * @param criteria A string 'property_name;name.first;name.last'
 * @param any If true, removes duplicate if any of criteria is met
 * @param crossCompare If true, compares criteria to one another
 */
export const removeDuplicates = <T extends {}>(v: T[], criteria: string, any = false, crossCompare = false): T[] => {
    if (!Array.isArray(v)) {
        console.warn(`V is not array: '${v}'`);
        return v;
    }
    // Converts string to [['name'], ['name','first']]
    const criterias = criteria.split(';').map((s) => s.split('.').map((p) => p.trim()));
    const getFields = (v: any, fields: string[]) => fields.reduce((a, v) => (a ? a[v] : a), v);
    const someOrMany = any ? Array.prototype.some : Array.prototype.every;
    const same = (a: any, b: any) => typeof a !== 'undefined' && typeof b !== 'undefined' && a === b;
    // Reduces array while comparing
    return v.reduce((a, v) => {
        // If not every criteria is met, push to the new array
        if (
            // If couldnt find duplicate, push the new object
            !a.find((av) => {
                return someOrMany.call(criterias, (c1) => {
                    const r = crossCompare
                        ? someOrMany.call(criterias, (c2) => {
                              return same(getFields(av, c1), getFields(v, c2));
                          })
                        : same(getFields(av, c1), getFields(v, c1));
                    return r;
                });
            })
        )
            a.push(v);
        return a;
    }, [] as T[]);
};

/**
 * Returns a function that sets up a timeout to call itself only when debounce done
 * @param callback
 * @param wait in ms
 * @returns
 */
export const debounceCreator = <T extends Function>(callback: T, wait: number = 0) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
        const context = this;
        clearTimeout(timeout);
        if (wait > 0) {
            timeout = setTimeout(() => callback.apply(context, args), wait);
        } else {
            callback.apply(context, args);
        }
    };
};

export type RecursivePartial<T> = {
    [P in keyof T]?: RecursivePartial<T[P]>;
};

export const toUpperCaseFirst = (s?:string)=>{
    if(typeof s === 'string'){
        return s.replace(/\b\w/g, c => c.toUpperCase());
    }
}