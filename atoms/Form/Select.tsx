import { useTheme } from '../Theme';
import { classNameFind as classFind } from '../../utils';
import React, { forwardRef, ReactNode } from 'react';
import { useFormField, UseFormFieldProps } from './Form';
import s from './Select.module.scss';

interface PlaceholderProps {
    disabled?: boolean;
    value?: string | number;
}

export interface SelectProps extends UseFormFieldProps {
    children?: ReactNode;
    placeholderProps?: PlaceholderProps;
}
type SelectPropsF = SelectProps & React.SelectHTMLAttributes<HTMLElement>;
const Select = ({ className, placeholder, placeholderProps, children, ..._props }: SelectPropsF, ref) => {
    const theme = useTheme().name;
    className = classFind(s, `comp`, className, 'dup', theme);

    const { value, ...props } = useFormField(_props);
    const placeProps = { disabled: !!placeholderProps?.disabled, selected: true };
    return (
        <select
            data-value={value || ''}
            className={className}
            value={value}
            {...props}
            ref={typeof ref === 'object' && !Object.keys(ref).length ? null : ref}
        >
            <option {...placeProps} value={placeholderProps?.value || ''}>
                {placeholder}
            </option>
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
