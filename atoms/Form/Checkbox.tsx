import React, { forwardRef } from 'react';
import { classNameFind as classFind } from '../../utils';
import { useTheme } from '../Theme';
import s from './Checkbox.module.scss';
import { FieldCommon } from './Field';
import { useFormField } from './Form';

export interface CheckboxProps extends FieldCommon {}

/**
 * ! Currently can only be used inside Field Component, or label tag
 */
const Checkbox = forwardRef<HTMLInputElement, CheckboxProps & React.InputHTMLAttributes<HTMLElement>>(
	({ className, children, ..._props }, ref) => {
		const theme = useTheme().name;
		className = classFind(s, `input`, className, 'dup', theme);

		const props = useFormField({ valueName: 'checked', ..._props });

		return (
			<>
				<input {...props} ref={ref} type='checkbox' hidden className={className} />
				<div tabIndex={0} className={classFind(s, 'control')}></div>
			</>
		);
	}
);

export default Checkbox;
