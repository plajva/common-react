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
import { useTheme } from '../Theme';
import { classNameFind as classFind, combineEvent } from '../../utils';
import React, { forwardRef } from 'react';
import { FieldCommon } from './Field';
import { useFormField, UseFormFieldProps } from './Form';
import s from './Radio.module.scss';

export interface RadioProps extends FieldCommon, UseFormFieldProps {value?: boolean | string | undefined}
/**
 * onChange triggers when radio selected/deselected
 *
 * ! Currently can only be used inside Field Component, or label tag
 */
const Radio = forwardRef<HTMLInputElement, RadioProps & React.InputHTMLAttributes<HTMLElement>>(
    ({ className, checked, value, children, ..._props }, ref) => {
        const theme = useTheme().name;
        className = classFind(s, `input`, className, 'dup', theme);
        
        // if(toForm || fromForm)console.error("Don't put toForm and fromForm on Radio fields");
        
        const { valueForm, ...props } = useFormField({ ..._props, value });

        const isChecked = checked ?? (typeof valueForm !== 'undefined' ? valueForm === value : false);
        return (
            <>
                <input
                    {...props}
                    className={className}
                    ref={ref}
                    type='radio'
                    hidden
                    // onChange={formOnChange}
                    // Set the radio checked if it's string value and value of form field are same, or checked prop is set
                    checked={isChecked}
                    data-value={isChecked}
                    // Make the value of radio it's string value
                    value={typeof value === 'boolean' ?(value?'true':''):value}
                />

                <div className={classFind(s, 'control')}></div>
            </>
        );
    }
);

export default Radio;
