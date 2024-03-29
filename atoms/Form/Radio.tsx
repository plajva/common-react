/**
 * A radio component
 * Passing an value:
 * 1. input.checked = value
 *
 * Form:
 * to: input.checked
 * from: input.checked
 *
 */
import React, { forwardRef } from 'react';
import { classNameFind as classFind } from '../../utils';
import { useTheme } from '../Theme';
import { FieldCommon } from './Field';
import { nameCombine, useForm, useFormField, UseFormFieldProps, useFormNameContext } from './Form';
import s from './Radio.module.scss';

export interface RadioProps extends FieldCommon, UseFormFieldProps {
	value?: boolean | string | undefined;
}
/**
 * onChange triggers when radio selected/deselected
 *
 * ! Currently can only be used inside Field Component, or label tag
 */
const Radio = forwardRef<HTMLInputElement, RadioProps & React.InputHTMLAttributes<HTMLElement>>(
	({ className, checked, children, ...props }, ref) => {
		const theme = useTheme().name;
		className = classFind(s, `input`, className, 'dup', theme);

		const nameContext = useFormNameContext();
		const valueForm = useForm().getValue(nameCombine(nameContext, props.name));

		const isChecked = checked ?? (typeof valueForm !== 'undefined' ? valueForm === props.value : false);
		return (
			<>
				<input
					{...useFormField({ ...props })}
					className={className}
					ref={ref}
					type='radio'
					hidden
					// onChange={formOnChange}
					// Set the radio checked if it's string value and value of form field are same, or checked prop is set
					checked={isChecked}
					data-value={isChecked}
					// Make the value of radio it's string value
					value={typeof props.value === 'boolean' ? (props.value ? 'true' : '') : props.value}
				/>

				<div className={classFind(s, 'control')}></div>
			</>
		);
	}
);

export default Radio;
