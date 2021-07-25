// This will create the basic state handlers for input elements
import React, { createElement, ForwardedRef, forwardRef, ReactNode } from "react";
import { FormFieldHOC } from "./Form";
import Input from "./Input";
import Select, { SelectRef } from "./Select";
import Toggle from "./Toggle";
import s from "./Field.module.scss";
import { useTheme } from "../Theme";
import { classNameFind } from "src/common/utils";
import Radio from "./Radio";

interface FieldProps extends _FieldProps {}
export interface _FieldProps {
	type?: "checkbox" | "email" | "number" | "text" | "radio" | "range" | "select" | "textarea" | "toggle" | "date";
	children?: ReactNode;
	ref?: any;
	label?: string;
	id?: string;
}

export type FieldCommon = { value?: any; onChange?: (v: any) => void };

export type InputPropsAll =
	| React.InputHTMLAttributes<HTMLElement>
	| React.SelectHTMLAttributes<HTMLElement>
	| React.TextareaHTMLAttributes<HTMLElement>;

export const Field = ({ children, label, className, type, ...props }: FieldProps & InputPropsAll) => {
	const theme = useTheme().name;
	className = classNameFind(s, `comp`, className, "dup", theme);

	const select_or_textarea = ["select", "textarea"].includes(type || "");

	const el_type =
		type === "toggle"
			? Toggle
			: type === "select"
			? Select
			: type === "radio"
			? Radio
			: select_or_textarea
			? (eprops) => {
					return FormFieldHOC(createElement(type || "input", eprops));
			  }
			: Input;

	const labelPersistent = ["toggle", "checkbox", "radio"].includes(type || "");

	return (
		<div className={className}>
			<label className={classNameFind(s, "label-container")}>
				{createElement(el_type, {
					children: select_or_textarea ? children : undefined,
					type: type,
					className: classNameFind(s, "input"),
					...props,
				})}
				<span
					// htmlFor={props.id}
					className={classNameFind(s, labelPersistent ? "label-persitent" : "label")}
				>
					{label} {props.required ? <span style={{ color: "red" }}>*</span> : ""}
				</span>
			</label>
		</div>
	);
};
