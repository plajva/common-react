// This will create the basic state handlers for input elements
import { Property } from 'csstype';
import React, { createElement, ReactNode } from 'react';
import { useState } from 'react';
import { classNameFind } from '../../utils';
import { useTheme } from '../Theme';
import Checkbox, { CheckboxProps } from './Checkbox';
import s from './Field.module.scss';
import {
    FormFieldHOC,
    InputPropsAll,
    useFieldError,
    useFieldValue,
    UseFormFieldOptions,
    useFormNameContextCombine,
} from './Form';
import Input from './Input';
import Radio, { RadioProps } from './Radio';
import Select, { SelectProps } from './Select';
import Toggle, { ToggleProps } from './Toggle';

const InputFile = (props) => {
    const [state,setState] = useState({files:null as (FileList | null)})
    const files:(File|null)[]=[];
    if(state.files){
        for(let i=0;i<state.files.length;++i)files.push(state.files.item(i));
    }
    return (<>
        <div style={{ padding:'.2em', border:'1px dashed rgba(127,127,127,.7)', textAlign:'center', width:'100%'}}>{(files?.length && files.map((f,i) => f && <>{i && <br/>}{f.name}</>)) || 'Select File'}</div>
        <input {...props} style={{display:'none'}} type="file" data-value={files.length ? 'true':undefined} onChange={(e) => setState({files: e.target.files})} />
    </>)
}

export interface FieldProps {
    type?:
        | 'checkbox'
        | 'email'
        | 'number'
        | 'text'
        | 'password'
        | 'radio'
        | 'range'
        | 'select'
        | 'textarea'
        | 'toggle'
        | 'file'
        | 'date';
    children?: ReactNode;
    ref?: any;
    direction?: 'right' | 'left' | 'top' | 'bottom';
    label?: ReactNode;
    error?: string;
    id?: string;
    rel?: boolean;
    rootProps?: object;
    labelProps?: React.LabelHTMLAttributes<HTMLLabelElement>;
    labelBottom?: ((v: any) => any) | any;
}

export type FieldCommon = { name?: string; value?: any; onChange?: (v: any) => void } & UseFormFieldOptions;
type InputComponentProps = ToggleProps | SelectProps | CheckboxProps | RadioProps;

export const Field = ({
    children,
    label,
    labelBottom,
    labelProps,
    rootProps,
    className,
    direction,
    error,
    type,
    name,
    ...props
}: FieldProps & InputPropsAll & InputComponentProps) => {
    const theme = useTheme().name;
    className = classNameFind(s, `comp`, className, 'dup', theme);

    const select_or_textarea = ['select', 'textarea'].includes(type || '');
    const tog_sel_check_radio = ['toggle', 'select', 'checkbox', 'radio', 'file'].includes(type || '');

    const el_type =
        type === 'toggle'
            ? Toggle
            : type === 'select'
            ? Select
            : type === 'checkbox'
            ? Checkbox
            : type === 'radio'
            ? Radio
            : type === 'file'
            ? InputFile
            : select_or_textarea
            ? (eprops) => {
                  return FormFieldHOC(createElement(type || 'input', eprops));
              }
            : Input;

    const labelPersistent = ['toggle', 'checkbox', 'radio'].includes(type || '');
    let flexDirection: Property.FlexDirection = labelPersistent
        ? direction === 'bottom'
            ? 'column'
            : direction === 'top'
            ? 'column-reverse'
            : direction === 'left'
            ? 'row-reverse'
            : 'row'
        : 'column';

    // Use upper name context if available
    name = useFormNameContextCombine(name);
    // Use a field error
    const fieldError = useFieldError(name);
    error = error || fieldError;

    const fieldValue = useFieldValue(name);
    // Define labelBottom if function
    if (typeof labelBottom === 'function') {
        labelBottom = labelBottom(fieldValue);
        // console.log("Label bottom: ", labelBottom);
    }

    const input = createElement(el_type, {
        children: select_or_textarea ? children : undefined,
        type,
        className: classNameFind(s, 'input'),
        name,
        ...props,
    });
    const { className: clsLabel, style: styLabel, htmlFor, ...lblProps } = labelProps ?? {};
    return (
        <div {...rootProps} className={className}>
            <label
                htmlFor={props.id}
                className={classNameFind(s, 'label-container', clsLabel)}
                style={{ flexDirection, cursor: tog_sel_check_radio ? 'pointer' : undefined, ...styLabel }}
                {...lblProps}
            >
                {input}
                <span className={classNameFind(s, labelPersistent ? 'label-text-persitent' : 'label-text')}>
                    {label} {props.required ? <span style={{ color: 'red' }}>*</span> : ''}
                </span>
                {(error || labelBottom) && (
                    <span
                        className={classNameFind(s, 'label-text-bottom border-radius-bottom-1', error ? 'error' : '')}
                    >
                        {error || labelBottom}
                    </span>
                )}
            </label>
        </div>
    );
};

export default Field;
