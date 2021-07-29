// This will create the basic state handlers for input elements
import React, { createElement, ReactNode } from "react";
import {
	FormFieldHOC,
	FormNameProvider,
	UseFormFieldOptions,
	InputPropsAll,
	useFieldError,
	useFormNameContext,
	useFormNameContextCombine,
	useForm,
	useFieldValue,
} from "./Form";
import Input from "./Input";
import Select, { SelectProps } from "./Select";
import Toggle, { ToggleProps } from "./Toggle";
import s from "./Field.module.scss";
import { useTheme } from "../Theme";
import { classNameFind } from "src/common/utils";
import Radio, { RadioProps } from "./Radio";
import Checkbox, { CheckboxProps } from "./Checkbox";
import { Property } from "csstype";
import { string_format } from "./form_utils";

export interface FieldProps {
	type?: "checkbox" | "email" | "number" | "text" | "radio" | "range" | "select" | "textarea" | "toggle" | "date";
	children?: ReactNode;
	ref?: any;
	direction?: "right" | "left" | "top" | "bottom";
	label?: string;
	error?: string;
	id?: string;
	rel?: boolean;
	rootProps?: object;
	labelBottom?: ((v: any) => any) | any;
}

export type FieldCommon = { name?: string; value?: any; onChange?: (v: any) => void } & UseFormFieldOptions;
type InputComponentProps = ToggleProps | SelectProps | CheckboxProps | RadioProps;

export const Field = ({
	children,
	label,
	labelBottom,
	rootProps,
	className,
	direction,
	error,
	type,
	name,
	...props
}: FieldProps & InputPropsAll & InputComponentProps) => {
	const theme = useTheme().name;
	className = classNameFind(s, `comp`, className, "dup", theme);

	const select_or_textarea = ["select", "textarea"].includes(type || "");
	const tog_sel_check_radio = ["toggle", "select", "checkbox", "radio"].includes(type || "");

	const el_type =
		type === "toggle"
			? Toggle
			: type === "select"
			? Select
			: type === "checkbox"
			? Checkbox
			: type === "radio"
			? Radio
			: select_or_textarea
			? (eprops) => {
					return FormFieldHOC(createElement(type || "input", eprops));
			  }
			: Input;

	const labelPersistent = ["toggle", "checkbox", "radio"].includes(type || "");
	let flexDirection: Property.FlexDirection = labelPersistent
		? direction === "bottom"
			? "column"
			: direction === "top"
			? "column-reverse"
			: direction === "left"
			? "row-reverse"
			: "row"
		: "column";

	// Use upper name context if available
	name = useFormNameContextCombine(name);
	// Use a field error
	const fieldError = useFieldError(name);
	error = error || fieldError;

	const fieldValue = useFieldValue(name);
	// Define labelBottom if function
	if (typeof labelBottom === "function") {
		labelBottom = labelBottom(fieldValue);
		console.log("Label bottom: ", labelBottom);
	}

	const input = createElement(el_type, {
		children: select_or_textarea ? children : undefined,
		type,
		className: classNameFind(s, "input"),
		name,
		...props,
	});
	return (
		<div {...rootProps} className={className}>
			<label
				htmlFor={props.id}
				className={classNameFind(s, "label-container")}
				style={{ flexDirection, cursor: tog_sel_check_radio ? "pointer" : undefined }}
			>
				{input}
				<span className={classNameFind(s, labelPersistent ? "label-text-persitent" : "label-text")}>
					{label} {props.required ? <span style={{ color: "red" }}>*</span> : ""}
				</span>
				{(error || labelBottom) && (
					<span className={classNameFind(s, "label-text-bottom border-radius-bottom-1", error ? "error" : "")}>
						{error || labelBottom}
					</span>
				)}
			</label>
		</div>
	);
};
