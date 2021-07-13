import { classNameFind } from '@common/utils';
import { ErrorMessage, Field as FField, FieldAttributes, useFormikContext } from 'formik';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import React, { FunctionComponent, HTMLAttributes, ReactNode } from 'react';
import s from './Field.module.scss';
import Input from './Input';
import { useTheme } from '../Theme';

// function getCompType(type:string){
// 	switch(type){
// 		case 'text':return
// 		default:
// 			return <input />;
// 	}
// }

export type FieldProps = (
    | React.InputHTMLAttributes<HTMLElement>
    | React.SelectHTMLAttributes<HTMLElement>
    | React.TextareaHTMLAttributes<HTMLElement>
) &
    FieldAttributes<any> & {
        classNameComponent?: string;
        label?: ReactNode;
        noLabelRoot?: boolean;
        /** If true there will be no FormikField, just whatever is in 'as' */
        noField?: boolean;
        // labelFirst?:boolean,
        labelPos?: 'top' | 'right' | 'bottom' | 'left';
        type?:
            | 'password'
            | 'date'
            | 'checkbox'
            | 'email'
            | 'number'
            | 'text'
            | 'radio'
            | 'range'
            | 'select'
            | 'textarea';
        rootProps?: React.LabelHTMLAttributes<HTMLElement>;
        labelErrorProps?: HTMLAttributes<{}>;
    };

const Field: FunctionComponent<FieldProps> = (props) => {
    let {
        className,
        classNameComponent,
        as,
        rootProps,
        noField,
        name,
        label,
        labelPos,
        children,
        type,
        noLabelRoot,
        labelErrorProps,
        ...others
    } = props;
    const theme = useTheme().name;

    // Changing 'as' based on 'type'
    let isNotInput = type && ['select', 'textarea'].includes(type);
    if (!as && type && isNotInput) {
        as = type;
        type = undefined;
    }

    // As defaults to 'input'
    as = as || 'input';

    // Switching to our custom fields
    switch (as) {
        case 'input':
            as = Input;
            break;
        case 'date':
            as = DayPickerInput;
    }

    // Defining position
    const radio_or_check = ['radio', 'checkbox'].includes(type ?? '');
    labelPos = labelPos || (radio_or_check && 'right') || 'top';

    const t_or_b = ['top', 'bottom'].includes(labelPos);

    // Defining field
    let fieldChildren = undefined;
    if (isNotInput) {
        fieldChildren = children;
        children = undefined;
    }
    let formik = useFormikContext();
    const field = noField ? (
        as
    ) : (
        <FField
            style={
                t_or_b
                    ? { marginLeft: 'auto', marginRight: 'auto', display: 'block' }
                    : { width: radio_or_check ? 30 : '50%', height: radio_or_check ? 'auto' : undefined }
            }
            className={classNameFind(s, `field`, as === 'select' ? 'field-select' : '', classNameComponent, theme)}
            name={name}
            as={as}
            type={type}
            {...others}
            children={fieldChildren}
        />
    );

    // Defining label
    const labelText = (label || children) && (
        <div
            className={classNameFind(s, `label`, `label-${labelPos}`)}
            style={t_or_b ? {} : { width: radio_or_check ? 'calc(100% - 40px)' : '50%', float: labelPos }}
        >
            <div style={children ? { marginBottom: '10px' } : {}}>{label}</div>
            {children}
        </div>
    );

    return React.createElement(
        noLabelRoot ? 'div' : 'label',
        {
            className: classNameFind(s, `atom`, radio_or_check ? 'radio' : '', 'dup', className),
            ...rootProps,
        },
        <>
            {labelPos == 'right' || labelPos == 'bottom' ? (
                <>
                    {field}
                    {labelText}
                </>
            ) : (
                <>
                    {labelText}
                    {field}
                </>
            )}
            <div style={{ clear: 'both' }} />
            <div style={{ color: 'red', textAlign: 'center' }} {...labelErrorProps}>
                <ErrorMessage name={name} />
            </div>
        </>
    );

    // <label
    // 	className={classNameFind(s, `atom`, radio_or_check ? 'radio' : '', 'dup', className)}
    // 	{...rootProps}
    // >
    // 	{
    // 		labelPos=='right'||labelPos=='bottom'?
    // 			<>
    // 			{field}
    // 			{labelText}
    // 			</>
    // 		:
    // 			<>
    // 			{labelText}
    // 			{field}
    // 			</>

    // 	}
    // 	<div style={{clear:'both'}}/>
    // 	<ErrorMessage name={name} />
    // </label>
};

export default Field;
