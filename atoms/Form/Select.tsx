import { useTheme } from "@catoms/Theme";
import { classNameFind as classFind } from "@common/utils";
import React, {
	Children,
	cloneElement,
	forwardRef,
	isValidElement,
	ReactNode,
} from "react";
import { UseFormFieldProps, useFormField } from "./Form";
import s from "./Select.module.scss";

export interface SelectProps extends UseFormFieldProps {
	children?: ReactNode;
}
type SelectPropsF = SelectProps & React.SelectHTMLAttributes<HTMLElement>;
const Select = ({ className, children, ..._props }: SelectPropsF, ref) => {
	const theme = useTheme().name;
	className = classFind(s, `comp`, className, "dup", theme);

	const { value, ...props } = useFormField(_props);
	return (
		<select
			data-value={value || ""}
			className={className}
			value={value}
			{...props}
			ref={typeof ref === "object" && !Object.keys(ref).length ? null : ref}
		>
			<option></option>
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
