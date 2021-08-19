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
import { combineEvent,  } from '../../utils';
import { cloneDeep, get, isEqual, set, setWith } from 'lodash';
import StateCombineHOC, { StateCombineContext, StateCombineProps } from '../HOC/StateCombineHOC';

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

export interface FormState {
    values?: any;
    errors?: MyError;
    touched?: any;
}
interface FormContextExtra {
    setValue: (name: string, value: any) => void;
    // setError: (name: string, value: any) => void;
    setTouched: (name: string, value: any) => void;
    getValue: (name: string) => any;
    getError: () => MyError;
    getTouched: (name: string) => any;
    getValid: () => any;
    submit: () => void;
    reset: () => void;
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
});

export const useForm = () => useContext(FormContext);

interface FormProps {
    // initialState?: object;
    /** Defaults to initialState, if reset, state will become this */
    resetState?: FormState;
    /**Accepts a schema from zod/yup */
    validationSchema?: any;
    onSubmit?: (v: any) => void;
    onChange?: (v: FormState) => void;
    readonly?: boolean;
    onReset?: (v: FormState) => void;
    children?: ReactNode | ((context: FormContextI) => ReactElement);
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
    onSubmit,
    onReset,
    onChange,
    children,
    ...props
}: FormProps & StateCombineProps<FormState>) => {
    // Will always re-render if schema & state=initialState bc we need to set default values from schema
    // console.log('Form Getting', state)
    // if (state === initialState && schema) {
    //     setState((s) => getInitial(initialState, schema));
    // }
    const resetState = useMemo( () =>  cloneDeep(_resetState ?? initialState), [initialState , _resetState] );

    // Happens on submission
    const getValid = () => {
        const values = state.values;
        let valid = values;
        if (schema) {
            try {
                valid = isZod(schema) ? schema.parse(values) : schema.validateSync(values, { abortEarly: false });
            } catch (_error) {
                // Set touched to true so all errors are shown
                setState((state) => {
                    return { ...state, touched: true };
                });
                return undefined;
            }
        }
        setState((state) => {
            return { ...state, touched: false };
        });
        return valid;
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
        setValue: (name, value) => {
            setState((state) => {
                let values = readonly ? state.values : replaceForm(name, value, state.values);

                // Doing validation
                let errors: MyError;
                if (schema) {
                    try {
                        values = isZod(schema)
                            ? schema.parse(values)
                            : schema.validateSync(values, { abortEarly: false });
                    } catch (_error) {
                        errors = [];

                        if (isZod(schema)) {
                            let e = _error; //as z.ZodError;
                            // const e = _error as Omit<z.ZodError, 'issues'> & {issues?:any};
                            // if(e.message)errors.push({path:'', message:e.message});
                            if (e?.errors.length) {
                                errors.push(
                                    ...e.errors.map((issue) => {
                                        return {
                                            path: issue.path.reduce(
                                                (fullPath, currPath) =>
                                                    fullPath +
                                                    '.' +
                                                    String(typeof currPath === 'number' ? `[${currPath}]` : currPath),
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
                            const e = _error; //as y.ValidationError;
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
        getError: () => {
            return getForm(`errors`, state) as MyError;
        },
        getTouched: (name) => {
            // Return true if showing all errors
            if (state.touched === true) return true;
            return getForm(`touched.${name}`, state);
        },
        getValid,
        reset: () => {
            setState(resetState);
            onReset && onReset(resetState);
        },
        submit: () => {
            const valid = getValid();
            if (!valid) {
                console.log('Form not valid: ', state.errors);
            }
            onSubmit && onSubmit(valid);
        },
    };
    // console.log(state);
    return (
        <FormContext.Provider value={context}>
            {typeof children === 'function' ? children(context) : children}
        </FormContext.Provider>
    );
};
export const UseForm = ({ children, ...props }: { children: (form: { getValueRel? } & FormContextI) => any }) => {
    const name = useFormNameContext();
    const form = useForm();
    return typeof children === 'function'
        ? children({ ...form, getValueRel: (n: string) => form.getValue(name ? name + '.' + n : n) })
        : children;
};

export type UseFormFieldProps = { name?: string; value?: any };
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
}
/**
 * Returns the handlers for fields using the FormContext to set/get values
 * @param props, consumes (onBlur, onChange, value, name)
 * @param opts
 * @returns newProps (onBlur, onChange, {valueName}) if name is valid, else just props
 */
export const useFormField = (
    props: InputPropsAll & UseFormFieldProps & UseFormFieldOptions
): InputPropsAll & UseFormFieldProps => {
    const { onBlur, onChange, valueName: _valueName, toForm, toFormBlur, fromForm, value, name, ..._props } = props;
    const form = useForm();
    const valueName = _valueName ? _valueName : 'value';
    const getValue = (name) => {
        let formValue = form.getValue(name);
        // if (_props['type'] === 'date' && typeof formValue === 'string')formValue = new Date(formValue)?.toISOString().substr(0,10) || formValue;
        return (value ??  formValue) || '';
    };
    return name
        ? {
              onChange: combineEvent((e) => {
                  form.setValue(name, toForm ? toForm(e, e.target[valueName]) : e.target[valueName]);
                  // console.log("OnChange");
                  form.setTouched(name, true);
              }, onChange),
              onBlur: combineEvent((e) => {
                  // form.setTouched(name, true);
                  if (toFormBlur) form.setValue(name, toFormBlur(e, e.target[valueName]));
              }, onBlur),
              onFocus: combineEvent((e) => {
                  //   form.setTouched(name, true);
                  // if(toFormBlur)form.setValue(name, toFormBlur(e,e.target[valueName]));
              }, onBlur),
              ...Object.fromEntries([[valueName, fromForm ? fromForm(getValue(name)) : getValue(name)]]),
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
export const useFormNameContextCombine = (n?: string) => {
    const nc = useFormNameContext();
    return nc && n ? nc + '.' + n : nc ? nc : n ? n : '';
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
    if (name) {
        name = normalizeName(name);
        const err = form.getError()?.find((e) => e.path === name)?.message;
        error = err && form.getTouched(name) && err;
    }
    return error;
};
// export const FieldError = (props: { name: string }) => {
// 	return useFieldError(props.name);
// };
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
// export const FieldValue = (props: { name: string }) => {
// 	return useFieldValue(props.name);
// };

type MapProps = Omit<HTMLAttributes<HTMLElement>, 'children'> & {
    root_type?: any;
    children?: ((props: { value; index }) => any) | ReactNode;
};
export interface FieldArrayProps<T> {
    name: string;
    children: (props: { arr: T[]; push; insert; remove; clear; Map: (props: MapProps) => any }) => any;
}
const Map =
    (arr: any[], arr_name) =>
    ({ children, root_type, ...props }: MapProps) => {
        // const nameContext = useFormNameContext();
        return (
            arr?.map((v, i) =>
                createElement(
                    root_type || 'div',
                    { key: i, ...props },
                    <FormNameProvider name={`${arr_name}[${i}]`} absolute>
                        {typeof children === 'function' ? children({ value: v, index: i }) : children}
                    </FormNameProvider>
                )
            ) || null
        );
    };
export const FieldArray = <T extends {}>({ name, children }: FieldArrayProps<T>) => {
    let arr_name = useFormNameContextCombine(name);
    const form = useForm();
    const _arr = form.getValue(arr_name) as any[],
        exists = Array.isArray(_arr);
    const push = (val) => {
        if (!exists) {
            form.setValue(arr_name, [val]);
        } else {
            _arr.push(val);
            form.setValue(arr_name, _arr);
        }
    };
    const insert = (index, val) => {
        if (!exists) {
            form.setValue(`${arr_name}[${index}]`, val);
        } else {
            _arr.splice(index, 0, val);
            form.setValue(arr_name, _arr);
        }
    };
    const remove = (index) => {
        if (exists) {
            _arr.splice(index, 1);
            form.setValue(arr_name, _arr);
        }
    };

    const clear = () => form.setValue(arr_name, []);
    return (
        <FormNameProvider name={name}>
            {children({
                arr: exists ? _arr : [],
                push,
                insert,
                remove,
                Map: Map(_arr, arr_name),
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
        touched: [],
        ...initialState,
        values,
    };
};
const Form = StateCombineHOC(FormComp, (props) => ({
    initialState: getInitial(props.initialState && cloneDeep(props.initialState), props.validationSchema),
}));
export default Form;
