import { useTheme } from '../Theme';
import { classNameFind as classFind } from '../../utils';
import React, { forwardRef } from 'react';
import { FieldCommon } from './Field';
import { useFormField } from './Form';
import s from './Toggle.module.scss';

export interface ToggleProps extends FieldCommon {}

/**
 * ! Currently can only be used inside Field Component, or label tag
 */
const Toggle = forwardRef<HTMLInputElement, ToggleProps & React.InputHTMLAttributes<HTMLElement>>(
    ({ className, children, ..._props }, ref) => {
        const theme = useTheme().name;
        className = classFind(s, `input`, className, 'dup', theme);

        const props = useFormField({ valueName: 'checked', ..._props });

        return (
            <>
                <input {...props} ref={ref} type='checkbox' hidden className={className} />
                <div className={classFind(s, 'control')}></div>
            </>
        );
    }
);

export default Toggle;
