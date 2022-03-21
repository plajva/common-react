import {
	cloneElement,
	createContext,
	createElement,
	HTMLAttributes,
	ReactElement,
	ReactNode,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';
// import * as y from 'yup';
// import * as z from 'zod';
import { classNameFind, combineEvent } from '../../utils';
import { cloneDeep, get, isEqual, set, setWith } from 'lodash';
import StateCombineHOC, { StateCombineContext, StateCombineProps } from '../HOC/StateCombineHOC';
import { useRef } from 'react';
import { useTheme } from '../Theme';

const splitName = (name: string) => {
	return name
		.replace(/\[/g, '.[')
		.split('.')
		.filter((v) => v);
};
const normalizeName = (name: string) => splitName(name).join('.');
const replaceForm = (name, v, obj) => set(obj, name, v);
const getForm = (name, obj) => get(obj, name);

type Issue = {
	path: string;
	message: string;
};

type MyError = Issue[] | undefined;
export type InputPropsAll =
	| React.InputHTMLAttributes<HTMLElement>
	| React.SelectHTMLAttributes<HTMLElement>
	| React.TextareaHTMLAttributes<HTMLElement>;

export interface FormState<T = any> {
	values?: T;
	errors?: MyError;
	touched?: any;
}

const debugForm = false;

interface FormContextExtra {
	setValue: (name: string, value: any) => void;
	// setError: (name: string, value: any) => void;
	setTouched: (name: string, value: any) => void;
	getValue: (name: string) => any;
	getError: (name?) => MyError | string;
	getTouched: (name: string) => any;
	getValid: () => FormState | undefined;
	submit: () => void;
	reset: (touched?: boolean) => void;
	clear: () => void;
	touchedShow?: boolean;
	touched?: boolean;
	errors?: boolean;
}
export type FormContextI = StateCombineProps<FormState> & FormContextExtra;

const FormContext = StateCombineContext<FormState, FormContextExtra>({
	state: {},
	setState: () => {},
	initialState: {},
	setValue: () => {},
	setTouched: () => {},
	getValue: () => {},
	getError: () => undefined,
	getTouched: () => {},
	getValid: () => undefined,
	submit: () => {},
	reset: () => {},
	clear: () => {},
});

export const useForm = () => useContext(FormContext);

interface FormProps {
	// initialState?: object;
	/** Defaults to initialState, if reset, state will become this */
	resetState?: FormState;
	/**Accepts a schema from zod/yup */
	validationSchema?: any;
	validationStrip?: boolean;
	/**
	 * Calls this function when values are valid, then resets touched
	 */
	onSubmit?: (v: any) => void;
	/**
	 * Only works with 1st level currently, no deep object allowed
	 * Values are filtered by wether they were touched or not
	 **/
	onSubmitChanges?: (v: any) => void;
	onChange?: (v: FormState) => void;
	readonly?: boolean;
	onReset?: (v: FormState) => void;
	children?: ReactNode | ((context: FormContextI) => ReactElement);
	useForm?: boolean;
	touchedShow?: boolean;
}
const isZod = (s: any): boolean => (s?.parse ? true : false);
const isYup = (s: any): boolean => (s?.validate ? true : false);

const FormComp = ({
	state,
	setState,
	initialState,
	readonly,
	resetState: _resetState,
	validationSchema: schema,
	validationStrip,
	onSubmit,
	onSubmitChanges,
	onReset,
	onChange,
	useForm,
	children,
	touchedShow,
	...props
}: FormProps & StateCombineProps<FormState>) => {
	// Will always re-render if schema & state=initialState bc we need to set default values from schema
	// console.log('Form Getting', state)
	// if (state === initialState && schema) {
	//     setState((s) => getInitial(initialState, schema));
	// }
	const resetState = useMemo(() => cloneDeep(_resetState ?? initialState), [initialState, _resetState]);
	const formRef = useRef<HTMLFormElement>(null);
	// This becomes true when we triggered a <form> submission from this component
	const formSubmitting = useRef<boolean>(false);

	// Happens on submission
	const getValid = () => {
		const values = state.values;
		let valid = values;
		if (schema) {
			try {
				valid = isZod(schema)
					? schema.parse(values)
					: schema.validateSync(values, { abortEarly: false, stripUnknown: validationStrip ?? false });
			} catch (_error) {
				// Set touched to true so all errors are shown
				setState((state) => {
					return { ...state, touched: true };
				});
				return undefined;
			}
		}
		const touched = state.touched;
		setState((state) => {
			return { ...state, touched: false };
		});
		return { values: valid, touched };
	};

	useEffect(() => {
		if (onChange) onChange(state);
	}, [state]);

	const context: FormContextI = {
		state,
		initialState,
		setState,
		touched: Boolean(typeof state.touched === 'object' ? Object.keys(state.touched)?.length : state.touched),
		errors: Boolean(typeof state.errors === 'object' ? Object.keys(state.errors)?.length : state.errors),
		touchedShow,
		setValue: (name, value) => {
			if (debugForm) console.log(`FormSetValue: ${name}: ${value} <${typeof value}>`);
			if (typeof name === 'undefined' || name === null) return;
			setState((state) => {
				// console.log("prev: ", JSON.stringify(state.values, undefined, 2))
				let values = readonly ? state.values : replaceForm(name, value, state.values);
				// console.log("after: ", JSON.stringify(values, undefined, 2))
				// Doing validation
				let errors: MyError;
				if (schema) {
					try {
						values = isZod(schema)
							? schema.parse(values)
							: schema.validateSync(values, { abortEarly: false, stripUnknown: validationStrip ?? false });
					} catch (_error) {
						errors = [];

						if (isZod(schema)) {
							let e: any = _error; //as z.ZodError;
							// const e = _error as Omit<z.ZodError, 'issues'> & {issues?:any};
							// if(e.message)errors.push({path:'', message:e.message});
							if (e?.errors?.length) {
								errors.push(
									...e.errors.map((issue) => {
										return {
											path: issue.path.reduce(
												(fullPath, currPath) =>
													fullPath + '.' + String(typeof currPath === 'number' ? `[${currPath}]` : currPath),
												''
											) as string,
											message: issue.message,
										};
									})
								);
								// Converts errors.issues into a deep issues object
								// e.issues = Object.values<any>(e.issues).reduce<any>(
								// 	(a, v) =>
								// 		replaceForm(
								// 			v.path.reduce((p, pv) => p + "." + String(typeof pv === "number" ? `[${pv}]` : pv), ""),
								// 			v.message,
								// 			a
								// 		),
								// 	{}
								// );
							}
							// errors = _errors;
						} else if (isYup(schema)) {
							const e: any = _error; //as y.ValidationError;
							values = e.value;
							const addError = (
								err //: y.ValidationError
							) => {
								if (!err) return;
								if (err.message) {
									let path = err.path || '';
									let message = err.message.replace(path, '').trim();
									if (message) message = message[0].toUpperCase() + message.substr(1);
									errors?.push({
										path: path && normalizeName(path),
										message: message,
									});
								}
								if (!err?.inner?.length) return;
								err.inner.forEach((ve) => addError(ve));
							};
							addError(e);
						}
					}
				}

				const newState = { ...state, values, errors };
				if (debugForm) console.log(newState);

				// console.log(JSON.stringify(newState.values, null, 2))

				return newState;
			});
		},
		setTouched: (name, value) => {
			// Don't do anything if we're showing all errors
			if (state.touched === true) return;
			setState((state) => {
				return { ...replaceForm(`touched.${name}`, value, state) } as FormState;
			});
		},
		getValue: (name) => {
			return getForm(`values.${name}`, state);
		},
		getError: (name?) => {
			const errors = getForm(`errors`, state) as MyError;
			return name ? errors?.find((e) => e.path === name)?.message : errors;
		},
		getTouched: (name) => {
			// Return true if showing all errors
			if (state.touched === true) return true;
			return getForm(`touched.${name}`, state);
		},
		getValid,
		reset: (touched) => {
			const rstate = typeof touched !== 'undefined' ? { ...resetState, touched } : resetState;
			setState(rstate);
			onReset && onReset(rstate);
		},
		clear: () => {
			setState({});
		},
		submit: () => {
			// To handle login info saving in the browser
			if (formRef.current && !formSubmitting.current) {
				// Calling submit on the <form> should call this function again
				formRef.current.submit();
				return;
			}
			// Proceed with submission
			let valid_s = getValid();
			if (!valid_s) {
				console.log('Form not valid: ', state.errors);
			}
			onSubmit && onSubmit(valid_s?.values);
			if (onSubmitChanges) {
				if (valid_s) {
					onSubmitChanges(
						Object.keys(valid_s)
							.filter((key) => valid_s?.touched[key])
							.reduce((obj, key) => {
								obj[key] = valid_s?.values[key];
								return obj;
							}, {})
					);
				} else onSubmitChanges(undefined);
			}

			// Reset the switch
			formSubmitting.current = false;
		},
	};
	// console.log(state);
	const childrenRender = typeof children === 'function' ? children(context) : children;
	return (
		<FormContext.Provider value={context}>
			{useForm ? (
				<form
					ref={formRef}
					onSubmit={(e) => {
						e.preventDefault();
						formSubmitting.current = true;
						context.submit();
					}}
				>
					{childrenRender}
				</form>
			) : (
				childrenRender
			)}
		</FormContext.Provider>
	);
};
export const UseForm = ({
	children,
	...props
}: {
	children: (form: { getValueRel?; setValueRel?; setTouchedRel? } & FormContextI) => any;
}) => {
	const name = useFormNameContext();
	const form = useForm();
	return (
		(typeof children === 'function'
			? children({
					...form,
					getValueRel: (n: string) => form.getValue(nameCombine(name, n)),
					setValueRel: (n: string, v: any) => form.setValue(nameCombine(name, n), v),
					setTouchedRel: (n: string, v?: boolean) => form.setTouched(nameCombine(name, n), v ?? true),
			  })
			: children) || null
	);
};

export type UseFormFieldProps = { name?: string; value?: any; valueForm?: any };
export interface UseFormFieldOptions {
	/**
	 * to use another value from element to set the form
	 * The value returned gets set in the form
	 * @param e is an onChange event
	 * @param v is the value that was supposed to go in the form
	 */
	toForm?: (e, v) => any;
	/**
	 * to use another value from element to set the form
	 * The value returned gets set in the form
	 * @param e is an onBlur event
	 * @param v is the value that was supposed to go in the form
	 */
	toFormBlur?: (e, v) => any;
	/**to use another value name as elements controlled value*/
	valueName?: string;
	/**to use another value as elements controlled value*/
	fromForm?: (v: any) => string;
	/**to use another value as elements controlled value*/
	// fromFormBlur?: (v: any) => string;
}
/**
 * Returns the handlers for fields using the FormContext to set/get values
 * @param props, consumes (onBlur, onChange, valueName, toForm, toFormBlur, fromForm, value, name)
 * @param opts
 * @returns newProps (onBlur, onChange, {valueName:---}) if name is true, else just mirrors props
 */
export const useFormField = (
	props: InputPropsAll & UseFormFieldProps & UseFormFieldOptions
): InputPropsAll & UseFormFieldProps => {
	const { onBlur, onChange, valueName: _valueName, toForm, toFormBlur, fromForm, value, name, ..._props } = props;

	const _name = useFormNameContextCombine(name);
	const form = useForm();
	const valueName = _valueName ?? 'value';

	const getValue = (n) => {
		let valueForm = form.getValue(n);
		return value ?? valueForm ?? '';
	};

	return name
		? {
				onChange: combineEvent((e) => {
					const v = toForm ? toForm(e, value ?? e.target[valueName]) : value ?? e.target[valueName];
					if (debugForm) console.log(`OnChange ${_name}: ${v} <${typeof v}>`);
					form.setValue(_name, v);
					form.setTouched(_name, true);
				}, onChange),
				/** Adds a function */
				onBlur: combineEvent((e) => {
					if (toFormBlur) {
						const v = toFormBlur(e, value ?? e.target[valueName]);
						if (debugForm) console.log(`OnBlur ${_name}: ${v} <${typeof v}>`);
						form.setValue(_name, v);
					}
				}, onBlur),
				onFocus: combineEvent((e) => {
					//   form.setTouched(name, true);
					//   if(toFormBlur)form.setValue(name, toFormBlur(e,e.target[valueName]));
				}, onBlur),
				/** Creating an object so we can make key dynamic */
				...Object.fromEntries([
					[
						/** Field value name */ valueName,
						/** Field Value */ fromForm ? fromForm(getValue(_name)) : getValue(_name),
					],
				]),
				..._props,
		  }
		: props;
};

// Combines onChange and onBlur and sets value if none provided
export const FormFieldHOC = (element: ReactElement<InputPropsAll & UseFormFieldProps & UseFormFieldOptions>) => {
	const newProps = useFormField(element.props);
	return element.props.name ? cloneElement(element, newProps) : element;
};

const FormNameContext = createContext('');
export const useFormNameContext = () => useContext(FormNameContext);
/**
 * Combines a previously set name context with the value provided
 * */
const nameCombine = (a?: string, b?: string) => (a && b ? a + '.' + b : a ? a : b ? b : '');
export const useFormNameContextCombine = (n?: string) => {
	const nc = useFormNameContext();
	return nameCombine(nc, n);
};
/**
 * Provides a name context to be used by Field/FieldArray/UseForm
 *
 * Can be stacked
 * */
export const FormNameProvider = (props: { children?: ReactNode; absolute?: boolean; name: string }) => {
	const name_context = useFormNameContextCombine(props.name);
	return (
		<FormNameContext.Provider value={props.absolute ? props.name : name_context}>
			{props.children}
		</FormNameContext.Provider>
	);
};

/**
 * Doesn't use the name context
 * @param name
 * @returns
 */
export const useFieldError = (name?: string) => {
	const form = useForm();
	let error: string | undefined;
	if (typeof name === 'string') {
		name = normalizeName(name);
		const err = form.getError(name);
		error = err && form.getTouched(name) && err;
	}
	return error;
};
export const FieldError = ({
	name,
	noCombine,
	className,
	...props
}: { name?: string; noCombine?: boolean } & HTMLAttributes<HTMLElement>) => {
	const theme = useTheme().name;
	const _className = classNameFind(undefined, `atom`, 'dup', theme, className);

	const nameC = useFormNameContextCombine(name);
	const error = useFieldError(noCombine ? name : nameC);
	return (
		<>
			{error && (
				<div className={_className} {...props}>
					{error}
				</div>
			)}
		</>
	);
};
/**
 * Doesn't use the name context
 * @param name
 * @returns
 */
export const useFieldValue = (name?: string) => {
	const form = useForm();
	let value: string | undefined;
	if (name) {
		name = normalizeName(name);
		value = form.getValue(name);
	}
	return value;
};
/**
 * Doesn't use the name context
 * @param name
 * @returns
 */
export const useFieldTouched = (name?: string) => {
	const form = useForm();
	let touched: string | undefined;
	if (name) {
		name = normalizeName(name);
		touched = form.getTouched(name);
	}
	return touched;
};
// export const FieldValue = (props: { name: string }) => {
// 	return useFieldValue(props.name);
// };

type MapProps = Omit<HTMLAttributes<HTMLElement>, 'children'> & {
	root_type?: any;
	keyName?: string;
	children?: ((props: { value; index }) => any) | ReactNode;
};
export interface FieldArrayProps<T> {
	name: string;
	children: (props: {
		arr: T[];
		push: (v) => void;
		insert: (i, v) => void;
		remove: (i) => void;
		clear: () => void;
		Map: (props: MapProps) => any;
	}) => any;
}
const Map =
	(arr: any[], arr_name) =>
	({ children, root_type, keyName, ...props }: MapProps) => {
		// const nameContext = useFormNameContext();
		return (
			arr?.map((v, i) =>
				createElement(
					root_type || 'div',
					{ key: v[keyName || ''] ?? v._id ?? v.id ?? i, ...props },
					<FormNameProvider name={`${arr_name}[${i}]`} absolute>
						{typeof children === 'function' ? children({ value: v, index: i }) : children}
					</FormNameProvider>
				)
			) || null
		);
	};
export const FieldArray = <T extends {}>({ name, children }: FieldArrayProps<T>) => {
	let _name = useFormNameContextCombine(name);
	const form = useForm();
	const _arr = form.getValue(_name) as any[],
		exists = Array.isArray(_arr);
	const touch = () => form.setTouched(_name, true);
	const push = (v) => {
		if (!exists) {
			form.setValue(_name, [v]);
		} else {
			_arr.push(v);
			form.setValue(_name, _arr);
		}
		touch();
	};
	const insert = (i, v) => {
		if (!exists) {
			form.setValue(`${_name}[${i}]`, v);
		} else {
			_arr.splice(i, 0, v);
			form.setValue(_name, _arr);
		}
		touch();
	};
	const remove = (i) => {
		if (exists) {
			_arr.splice(i, 1);
			form.setValue(_name, _arr);
		}
		touch();
	};
	const clear = () => {
		form.setValue(_name, []);
		touch();
	};

	return (
		<FormNameProvider name={name}>
			{children({
				arr: exists ? _arr : [],
				push,
				insert,
				remove,
				Map: Map(_arr, _name),
				clear,
			})}
		</FormNameProvider>
	);
};

const getInitial = (initialState?: FormState, schema?: any) => {
	let values = initialState?.values || {};
	try {
		values =
			(schema &&
				((isZod(schema) && schema.safeParse(initialState?.values)['data']) ||
					(isYup(schema) && schema.cast(initialState?.values)))) ||
			initialState?.values ||
			{};
	} catch (err) {
		console.error('Form initial state values parsing error: ', err);
	}

	return {
		// touched: [],
		...initialState,
		values,
	};
};
const Form = StateCombineHOC(FormComp, (props) => ({
	initialState: getInitial(props.initialState && cloneDeep(props.initialState), props.validationSchema),
}));
export default Form;
