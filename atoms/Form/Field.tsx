/**
 * This will create the basic state handlers for input elements
 * This component should be as generic as possible
 * ! DON'T like: editConfirm
 * * Could be implemented somewhere else, too much specificity.
 *
 * */
import { Property } from 'csstype';
import React, { createElement, ReactNode, useMemo, useState } from 'react';
import { MdCheck, MdEdit } from 'react-icons/md';
import { classNameFind, cnf, DistributiveOmit } from '../../utils';
import Button from '../Button';
import { useTheme } from '../Theme';
import Checkbox, { CheckboxProps } from './Checkbox';
import s from './Field.module.scss';
import {
	InputPropsAll,
	useFieldError,
	useFieldTouched,
	useFieldValue,
	useForm,
	useFormField,
	UseFormFieldOptions,
	UseFormFieldProps,
	useFormNameContextCombine,
} from './Form';
import Input from './Input';
import Radio, { RadioProps } from './Radio';
import Select, { SelectProps } from './Select';
import Toggle, { ToggleProps } from './Toggle';

const InputFile = (props) => {
	const [state, setState] = useState({ files: null as FileList | null });
	const files: (File | null)[] = [];
	if (state.files) {
		for (let i = 0; i < state.files.length; ++i) files.push(state.files.item(i));
	}
	return (
		<>
			<div
				style={{
					padding: '.2em',
					border: '1px dashed rgba(127,127,127,.7)',
					textAlign: 'center',
					width: '100%',
				}}
			>
				{(files?.length &&
					files.map(
						(f, i) =>
							f && (
								<>
									{i && <br />}
									{f.name}
								</>
							)
					)) ||
					'Select File'}
			</div>
			<input
				{...props}
				style={{ display: 'none' }}
				type='file'
				data-value={files.length ? 'true' : undefined}
				onChange={(e) => setState({ files: e.target.files })}
			/>
		</>
	);
};
interface TextareaProps extends UseFormFieldProps{
	heightauto?: true
}
const Textarea = ({heightauto, style,...props}: TextareaProps & React.TextareaHTMLAttributes<HTMLElement>) => {
	const fprops = useFormField(props);
	return <textarea data-value={(props.value??'') && 'true'} style={{width: '100%', height: (5+(String(fprops.value).match(/\n/g)||[])?.length) + 'em',...style}}  {...fprops}/>
}

interface _FieldProps {
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
	editConfirm?: boolean;
	label?: ReactNode;
	error?: string;
	id?: string;
	rel?: boolean;
	rootProps?: React.HTMLAttributes<HTMLElement>;
	inputProps?: React.InputHTMLAttributes<HTMLElement>;
	labelProps?: React.LabelHTMLAttributes<HTMLElement>;
	labelBottom?: ((v: any) => any) | any;
	/** Do you want label to change color when Field is touched? */
	touchedShow?: boolean;
}

export type FieldCommon = { name?: string; value?: any; onChange?: (v: any) => void } & UseFormFieldOptions;
type InputComponentProps = ToggleProps | SelectProps | CheckboxProps | RadioProps | TextareaProps;
export type FieldProps = _FieldProps & InputComponentProps & DistributiveOmit<InputPropsAll, 'value'>;

export const Field = ({
	children,
	label,
	labelBottom,
	labelProps,
	rootProps,
	inputProps,
	className,
	direction,
	editConfirm,
	error,
	type,
	touchedShow,
	name,
	...props
}: FieldProps) => {
	const theme = useTheme().name;
	className = classNameFind(s, `comp`, className, 'dup', theme, rootProps?.['className']);

	const select_or_textarea = ['select', 'textarea'].includes(type || '');
	const tog_sel_check_radio = ['toggle', 'select', 'checkbox', 'radio', 'file'].includes(type || '');

	const [allowEdit, setAllowEdit] = useState(false);

	const el_type = useMemo(
		() =>
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
				: type === 'textarea'
				? Textarea
				: Input,
		[type]
	);

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
	const _name = useFormNameContextCombine(name);
	// Use a field error
	const fieldError = useFieldError(_name);
	error = error ?? fieldError;
	const fieldValue = useFieldValue(_name);
	const fieldTouched = useFieldTouched(_name);
	

	const form = useForm();
	const touched = (touchedShow ?? form.touchedShow) && fieldTouched;
	// Define labelBottom if function
	if (typeof labelBottom === 'function') {
		labelBottom = labelBottom(fieldValue);
	}

	//@ts-ignore
	const input = createElement(el_type, {
		readOnly: editConfirm ? !allowEdit : undefined,
		placeholder: el_type === Select ? ' ' : undefined,
		...props,
		...inputProps,
		className: classNameFind(s, 'input', inputProps?.className),
		children: select_or_textarea || type === 'checkbox' ? children : undefined,
		type,
		name,
	});
	const { className: labelClass, style: labelStyle, ...labelPropsRest } = labelProps ?? {};
	return (
		<div {...rootProps} className={className}>
			<label
				{...labelPropsRest}
				htmlFor={props.id}
				className={classNameFind(s, 'label-container', type, labelClass)}
				style={{ flexDirection, cursor: tog_sel_check_radio ? 'pointer' : undefined, ...labelStyle }}
			>
				{input}
				<span
					className={classNameFind(
						s,
						labelPersistent ? 'label-text-persitent' : 'label-text',
						touched ? 'touched' : ''
					)}
				>
					{label} {props.required ? <span style={{ color: 'red' }}>*</span> : ''}
				</span>
				{(error || labelBottom) && (
					<span className={classNameFind(s, 'label-text-bottom border-radius-bottom-1', error ? 'error' : '')}>
						{error || labelBottom}
					</span>
				)}
				{/* Edit Overlay, for Fields that are not automatically editable */}
				{editConfirm && (
					<div className={cnf(s, 'edit-confirm')}>
						<Button
							onClick={(e) => {
								e.preventDefault();
								setAllowEdit(!allowEdit);
							}}
							// button_size='.5em'
							icon={allowEdit ? MdCheck : MdEdit}
							className={cnf(s, 'edit-button')}
						/>
					</div>
				)}
			</label>
		</div>
	);
};

export default Field;
