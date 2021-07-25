import { cloneElement, createContext, ReactElement, ReactNode, useContext, useState } from "react";
import { combineEvent, setDefault } from "src/common/utils";
import { useStateObject } from "src/common/utils_react";
import { InputPropsAll } from "./Field";

export interface FormState {
	values: any;
	errors: any;
	touched: any;
}
export interface FormContextI extends FormState {
	setValue: (name: string, value: any) => void;
	setError: (name: string, value: any) => void;
	setTouched: (name: string, value: any) => void;
	getValue: (name: string) => any;
	getError: (name: string) => any;
	getTouched: (name: string) => any;
}

const FormContext = createContext<FormContextI>({
	values: {},
	errors: {},
	touched: {},
	setValue: () => {},
	setError: () => {},
	setTouched: () => {},
	getValue: () => {},
	getError: () => {},
	getTouched: () => {},
});

export const useForm = () => useContext(FormContext);

const isArr = (key) => key[0] === "[" && key[key.length - 1] === "]";
const isTypeGood = (key, obj) => (isArr(key) ? Array.isArray(obj) : typeof obj === "object" && !Array.isArray(obj));
const keyToIndex = (key) => (isArr(key) ? Number(key.replace(/\[/g, "").replace(/\]/g, "")) : key);
const keyValid = (key) => typeof key === "string" && (isArr(key) ? keyToIndex(key) !== NaN : true);
const splitName = (name: string) => {
	return name
		.replace(/\[/g, ".[")
		.split(".")
		.filter((v) => v);
};
const replaceForm = (name: string, value: any, obj: object) => {
	let parent, grandparent, grand_key;
	let setParent = (val) => {
		grandparent[grand_key] = val;
	};
	const names = splitName(name);
	while (names.length) {
		const key = names.shift();
		// console.log(parent, key);
		// console.log(key)
		// If key's invalid break;
		if (!keyValid(key)) {
			throw Error(`key ${key} not valid`);
			break;
		}

		const isarr = isArr(key);
		const getMyObj = () => (typeof parent !== "undefined" ? parent : obj);
		const setMyObj = (val) => {
			if (parent) {
				parent = val;
				setParent(parent);
			} else obj = val;
		};
		const getKeyObj = () => getMyObj()[keyToIndex(key)];
		const setKeyObj = (val) => {
			// console.log(`Setting ${getMyObj()} ${key} with ${val}`);
			getMyObj()[keyToIndex(key)] = val;
		};
		// Make sure obj type is good
		if (!isTypeGood(key, getMyObj())) setMyObj(isarr ? [] : {});
		if (!names.length) {
			setKeyObj(value);
			break;
		} else if (typeof getKeyObj() === "undefined") {
			setKeyObj(true);
		}

		// Set parent with (obj||parent)[key]
		grandparent = getMyObj();
		grand_key = keyToIndex(key);
		parent = getKeyObj();
	}
	return obj;
};
const getForm = (name: string, obj: object) => {
	const names = splitName(name);
	while (names.length && typeof obj === "object") {
		const key = names.shift();
		if (!keyValid(key)) {
			throw Error(`key ${key} not valid`);
			break;
		}
		obj = obj[keyToIndex(key)];
		if (typeof obj === "undefined") return undefined;
	}
	return obj;
};

interface FormProps {
	initialState: object;
	children: ReactNode | ((state: FormState) => ReactNode);
}
const Form = ({ initialState, children, ...props }: FormProps) => {
	const [state, setState] = useState<FormState>({
		values: initialState,
		errors: {},
		touched: {},
	});
	const context: FormContextI = {
		...state,
		setValue: (name, value) => {
			setState((state) => {
				// console.log('Prev state', state)
				const replaced = { ...replaceForm(`values.${name}`, value, state) };
				// console.log('Replaced', replaced)
				return replaced as FormState;
			});
		},
		setError: (name, value) => {
			setState((state) => {
				return { ...replaceForm(`errors.${name}`, value, state) } as FormState;
			});
		},
		setTouched: (name, value) => {
			setState((state) => {
				return { ...replaceForm(`touched.${name}`, value, state) } as FormState;
			});
		},
		getValue: (name) => {
			return getForm(`values.${name}`, state);
		},
		getError: (name) => {
			return getForm(`errors.${name}`, state);
		},
		getTouched: (name) => {
			return getForm(`touched.${name}`, state);
		},
	};
	// console.log(state);
	return (
		<FormContext.Provider value={context}>
			{typeof children === "function" ? children(state) : children}
		</FormContext.Provider>
	);
};

// Combines onChange and onBlur and sets value if none provided
export const FormFieldHOC = (element: ReactElement<InputPropsAll & { name: string }>) => {
	const form = useForm();
	const ep = element.props;
	// const ownValueName = ep["type"] === "checkbox" ? "checked" : "value";
	// const valueName = ep["type"] === "checkbox" ? "checked" : "value";

	const newProps = {
		onChange: combineEvent((e) => {
			form.setValue(ep.name, e.target["value"]);
		}, ep.onChange),
		onBlur: combineEvent((e) => form.setTouched(ep.name, true), ep.onBlur),
		...Object.fromEntries([["value", setDefault(ep["value"], form.getValue(ep.name))]]),
	};
	// console.log(ep.name);
	return ep.name ? cloneElement(element, newProps) : element;
};

export type UseFormFieldProps = { name?: string; value?: any };
interface UseFormFieldOptions {
	/**
	 * to use another value from element to set the form
	 * The value returned gets set in the form
	 */
	toForm?: (e) => any;
	/**to use another value name as elements controlled value*/
	valueName?: string;
	/**to use another value as elements controlled value*/
	fromForm?: (value: any) => string;
}
/**
 * Returns the handlers for fields using the FormContext to set/get values
 * @param props, consumes (onBlur, onChange, value, name)
 * @param opts
 * @returns newProps (onBlur, onChange, {valueName}) if name is valid, else just props
 */
export const useFormField = (props: InputPropsAll & UseFormFieldProps, opts?: UseFormFieldOptions):InputPropsAll & UseFormFieldProps => {
	const { onBlur, onChange, value, name, ..._props } = props;
	const form = useForm();
	const valueName = opts?.valueName ? opts.valueName : "value";
	return name
		? {
				onChange: combineEvent((e) => {
					form.setValue(name, opts?.toForm ? opts.toForm(e) : e.target[valueName]);
				}, onChange),
				onBlur: combineEvent((e) => form.setTouched(name, true), onBlur),
				...Object.fromEntries([
					[
						valueName,
						opts?.fromForm
							? opts.fromForm(setDefault(value, form.getValue(name)))
							: setDefault(value, form.getValue(name)),
					],
				]),
				..._props,
		  }
		: props;
};

export interface FieldArrayProps<T> {
	name: string;
	children: (props: { arr: T[]; name; push; insert; remove; clear }) => any;
}
export const FieldArray = <T extends {}>({ name, children }: FieldArrayProps<T>) => {
	const form = useForm();
	const _arr = form.getValue(name) as any[],
		exists = Array.isArray(_arr);
	const push = (val) => {
		if (!exists) {
			form.setValue(name, [val]);
		} else {
			_arr.push(val);
			form.setValue(name, _arr);
		}
	};
	const insert = (index, val) => {
		if (!exists) {
			form.setValue(`${name}[${index}]`, val);
		} else {
			_arr.splice(index, 0, val);
			form.setValue(name, _arr);
		}
	};
	const remove = (index) => {
		if (exists) {
			_arr.splice(index, 1);
			form.setValue(name, _arr);
		}
	};
	const clear = () => form.setValue(name, []);
	return children({
		name,
		arr: exists ? _arr : [],
		push,
		insert,
		remove,
		clear,
	});
};

export default Form;
