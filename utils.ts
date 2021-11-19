import _ from 'lodash';

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
export function classNameFind(s?: object | undefined, ...classNames: (string | undefined)[]) {
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
					return s && s[c] ? s[c] + (dup ? ' ' + c : '') : c;
				})
				.filter((c) => c)
				.join(' ')
		: '';
}
export { classNameFind as cnf };

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
// export const setDefault = <T>(v: T | undefined, d: T): T => {
//     return typeof v === 'undefined' ? d : v;
// };

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
export const debounceCreatorCallback = <T extends (...args: any) => any>(callback: T, wait: number = 0) => {
	let timeout: NodeJS.Timeout;
	return (...args: Parameters<T>) => {
		const context = this;
		clearTimeout(timeout);
		if (wait > 0) {
			timeout = setTimeout(() => callback.apply(context, args), wait);
		} else {
			callback.apply(context, args);
		}
	};
};
export const debounceCreator = (wait: number) => debounceCreatorCallback((f: () => void) => f(), wait);

export type RecursivePartial<T> = {
	[P in keyof T]?: RecursivePartial<T[P]>;
};

export const toUpperCaseFirst = (s?: string) => {
	if (typeof s === 'string') {
		return s.replace(/\b\w/g, (c) => c.toUpperCase());
	}
};

export type ValuesOf<T extends any[]> = T[number];
export type Entries<T> = {
	[K in keyof T]: [K, T[K]];
}[keyof T][];
export function objectEntries<T>(obj: T): Entries<T> {
	return Object.entries(obj) as any;
}

export const jwtParse = (token) => {
	try {
		if (!token) throw Error('Token false');
		return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
	} catch (e) {
		return undefined;
	}
};

export function pruneEmpty(obj) {
	return (function prune(current) {
		_.forOwn(current, function (value, key) {
			if (
				_.isUndefined(value) ||
				_.isNull(value) ||
				_.isNaN(value) ||
				(_.isString(value) && _.isEmpty(value)) ||
				(_.isObject(value) && _.isEmpty(prune(value)))
			) {
				delete current[key];
			}
		});
		// remove any leftover undefined values from the delete
		// operation on an array
		if (_.isArray(current)) _.pull(current, undefined);

		return current;
	})(_.cloneDeep(obj)); // Do not modify the original object, create a clone instead
}

export type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;
