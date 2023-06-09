import React, { forwardRef, ReactNode } from 'react';
import { classNameFind as classFind } from '../../utils';
import { useTheme } from '../Theme';
import { useFormField, UseFormFieldProps } from './Form';
import s from './Select.module.scss';

export interface SelectProps extends UseFormFieldProps {
	children?: ReactNode;
	placeholderProps?: React.OptionHTMLAttributes<HTMLElement>;
	placeholder?: string | false;
}
type SelectPropsF = SelectProps & Omit<React.SelectHTMLAttributes<HTMLElement>, 'placeholder'>;
const Select = ({ className, placeholder, placeholderProps, children, ..._props }: SelectPropsF, ref) => {
	const theme = useTheme().name;
	className = classFind(s, `comp`, className, 'dup', theme);

	const { value, ...props } = useFormField(_props);
	const placeProps = {
		// * Warning on React console, pass 'value' on <select> instead of setting 'selected' on <option>
		// selected: true,
		className: classFind(s, 'placeholder'),
		...placeholderProps,
	};
	return (
		<select
			data-value={value ?? ''}
			className={className}
			value={value}
			{...props}
			ref={typeof ref === 'object' && !Object.keys(ref).length ? null : ref}
		>
			{typeof placeholder === 'string' && !!placeholder && (
				<option {...placeProps} value={placeholderProps?.value}>
					{placeholder}
				</option>
			)}
			{/* React already does this by default when a value prop is passed to <select> */}
			{/* Making sure selected element is the one with selected attribute */}
			{/* {Children.map(
				children,
				(child) => isValidElement(child) && cloneElement(child, child.props.value === value ? { selected: true } : {})
			)} */}
			{children}
		</select>
	);
};
export const SelectRef = forwardRef<HTMLSelectElement, SelectPropsF>(Select);
export default Select;
