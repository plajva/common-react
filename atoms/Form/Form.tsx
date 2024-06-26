import { clone, cloneDeep, get, set } from 'lodash';
import {
	cloneElement,
	createContext,
	createElement,
	HTMLAttributes,
	ReactElement,
	ReactNode,
	useContext,
	useEffect,
	useRef,
} from 'react';
// import * as y from 'yup';
// import * as z from 'zod';
import { classNameFind, combineEvent } from '../../utils';
import StateCombineHOC, { LCP, SCP, StateCombineContext } from '../HOC/StateCombineHOC';
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

export interface FormState<T extends {} = any> {
	values: T;
	errors?: MyError;
	touched?: any;
}
const FormStateInitial: FormState = { values: {} };

const debugForm = !!process.env.REACT_APP_DEBUG_FORM;

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
	// initialState?: FormState;
	// resetState?:FormState;
}
export type FormContextI = SCP<FormState> & FormContextExtra;

const FormContext = StateCombineContext<FormState, FormContextExtra>({
	state: cloneDeep(FormStateInitial),
	initialState: { values: {} },
	setState: () => {},
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
	/** Implemented with the idea that if this changes, state will become {values: resetValuesAuto}, kind of like an automatic reset state, triggered when this value changes, should probably */
	resetValuesAuto?: any;
	/** Defaults to initialState, if reset, state will become this */
	resetState?: FormState;
	/** Should we clear the form when submitting */
	onSubmitReset?: boolean;

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
	/**
	 * Executed when any changes are made to FormState, returns entire FormState, after validations (if any)
	 */
	onChange?: (v: FormContextI) => void;
	/**
	 * Executed when a single change is made to FormState, returns only changed fieldName and value, after validations (if any)
	 */
	onChanges?: (n: string, v: any, context: FormContextI) => void;
	readonly?: boolean;
	onReset?: (v: FormState) => void;
	children?: ReactNode | ((context: FormContextI) => ReactElement);
	useForm?: boolean;
	/** Do you want labels to change colors when Fields are touched? */
	touchedShow?: boolean;
}
const isZod = (s: any): boolean => (s?.parse ? true : false);
const isYup = (s: any): boolean => (s?.validate ? true : false);

const FormComp = ({
	state,
	setState,
	readonly,
	initialState,
	resetState,
	validationSchema: schema,
	validationStrip,
	onSubmit,
	onSubmitChanges,
	onSubmitReset,
	onReset,
	onChange,
	onChanges,
	useForm,
	children,
	touchedShow,
	...props
}: LCP<FormState, FormProps>) => {
	// Will always re-render if schema & state=initialState bc we need to set default values from schema
	// console.log('Form Getting', state)
	// if (state === initialState && schema) {
	//     setState((s) => getInitial(initialState, schema));
	// }
	// const initialState = useMemo(() => getInitial(cloneDeep(_initialState ?? {}), schema), [_initialState, schema]);
	const formRef = useRef<HTMLFormElement>(null);
	// This becomes true when we triggered a <form> submission from this component
	const formSubmitting = useRef<boolean>(false);
	const changes = useRef<string[]>([]);

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
	const clear = () => {
		setState(s=>cloneDeep(resetState || initialState || FormStateInitial));
	};
	const context: FormContextI = {
		state,
		initialState,
		// resetState,
		setState,
		touched: Boolean(typeof state.touched === 'object' ? Object.keys(state.touched)?.length : state.touched),
		errors: Boolean(typeof state.errors === 'object' ? Object.keys(state.errors)?.length : state.errors),
		touchedShow,
		setValue: (name, value) => {
			if (debugForm) console.log(`FormSetValue: ${name}: ${value} <${typeof value}>`);
			if (typeof name === 'undefined' || name === null) return;
			changes.current.push(name);
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
							}
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
			const rstate = { ...getInitial(cloneDeep(resetState || initialState || FormStateInitial), schema), touched };
			setState(rstate);
			if(onReset) onReset(rstate);else setTimeout(() => onChange?.({...context, state: rstate}), 15);
		},
		clear,
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
								obj[key] = valid_s?.values?.[key];
								return obj;
							}, {})
					);
				} else onSubmitChanges(undefined);
			}

			// Reset the switch
			formSubmitting.current = false;
			if(!!onSubmitReset && valid_s)clear();
		},
	};

	if (changes.current.length) {
		onChange?.(context);
		if (onChanges) changes.current.forEach((n) => onChanges(n, getForm(n, state.values), context));
		changes.current = [];
	}

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
	uncontrolled?: boolean
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
	const { onBlur, onChange, valueName: _valueName, toForm, toFormBlur, fromForm, value, uncontrolled, name, ..._props } = props;

	const _name = useFormNameContextCombine(name);
	const form = useForm();
	const valueName = _valueName ?? (uncontrolled ? 'defaultValue': 'value');

	const getValue = (n) => {
		let valueForm = form.getValue(n);
		return value ?? valueForm ?? '';
	};

	return name
		? {
				onChange: combineEvent((e) => {
					if (uncontrolled)return; // Dont handle changes if the thing is uncontrolled
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
				}),
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
// export const FormFieldHOC = (element: ReactElement<InputPropsAll & UseFormFieldProps & UseFormFieldOptions>) => {
// 	const newProps = useFormField(element.props);
// 	newProps['data-value'] = newProps.value || '';
// 	return element.props.name ? cloneElement(element, newProps) : element;
// };

const FormNameContext = createContext('');
export const useFormNameContext = () => useContext(FormNameContext);
/**
 * Combines a previously set name context with the value provided
 * */
export const nameCombine = (a?: string, b?: string) => (a && b ? a + '.' + b : a ? a : b ? b : '');
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

/**
 * Parses, initial state's default values defined on the validation schema
 * @param initialState
 * @param schema
 * @returns
 */
const getInitial = (initialState?: FormState, schema?: any) => {
	let values = initialState?.values ?? {};
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
		...initialState,
		values,
	};
};
const Form = StateCombineHOC({
	comp: FormComp,
	options: { initialState: clone(FormStateInitial) },
});
export default Form;
