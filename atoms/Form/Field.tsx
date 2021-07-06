import { classNameFind } from '@common/utils';
import { ErrorMessage, Field as FField, FieldAttributes, useFormikContext } from 'formik';
import React, { FunctionComponent, ReactNode } from 'react';
import s from './Field.module.scss';
import Input from './Input';

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
        label?: ReactNode;
        noLabelRoot?: boolean;
        /** If true there will be no FormikField, just whatever is in 'as' */
        noField?: boolean;
        // labelFirst?:boolean,
        labelPos?: 'top' | 'right' | 'bottom' | 'left';
        type?: 'checkbox' | 'email' | 'number' | 'text' | 'radio' | 'range' | 'select' | 'textarea';
        hidden?: boolean;
        // Item props
        rootProps?: React.LabelHTMLAttributes<HTMLElement>;
        inputProps?: React.InputHTMLAttributes<HTMLElement>;
        labelTextProps?: React.HtmlHTMLAttributes<HTMLElement>;
    };

const Field: FunctionComponent<FieldProps> = (props) => {
    let { className, as, rootProps, inputProps, labelTextProps, noField, name, label, labelPos, children, type, noLabelRoot, style, hidden, ...others } =
        props;

    // true when type is a 'select' or a 'textarea'
    let isNotInput = type && ['select', 'textarea'].includes(type);
    // Make as = type if as not defined and type is a 'select' or 'textarea'
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
    }
    
    // Defining position
    const radio_or_check = ['radio', 'checkbox'].includes(type);
    labelPos = labelPos || (radio_or_check && 'right') || 'top';
    const t_or_b = ['top', 'bottom'].includes(labelPos);

    // Defining field
    let fieldChildren = undefined;
    if (isNotInput) {
        fieldChildren = children;
        children = undefined;
    }
    
    const field = noField ? (
        as
    ) : (
        <FField
            style={{
                ...(hidden ? {opacity: 0, width: 0, height: 0} :
                    (t_or_b
                    ? { marginLeft: 'auto', marginRight: 'auto', display: 'block' }
                    : { width: radio_or_check ? 30 : '50%', height: radio_or_check ? 'auto' : undefined })),
                ...style,
                ...(inputProps?.style || {})
            }}
            className={classNameFind(s, `field`, inputProps?.className)}
            name={name}
            as={as}
            type={type}
            {...others}
            {...(inputProps||{})}
            children={fieldChildren}
        />
    );

    // Defining label
    const labelText = (label || children) && (
        <div
            className={classNameFind(s, `label`, `label-${labelPos}`, labelTextProps?.className)}
            style={hidden ? {width:'100%'} : (t_or_b ? {} : { width: radio_or_check ? 'calc(100% - 40px)' : '50%', float: labelPos })}
        >
            <div style={children ? { marginBottom: '10px' } : {}}>{label}</div>
            {children}
        </div>
    );

    return React.createElement(
        noLabelRoot ? 'div' : 'label',
        {
            ...(rootProps || {}),
            className: classNameFind(s, `atom`, radio_or_check ? 'radio' : '', 'dup', className, rootProps?.className),
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
            <div style={{ color: 'red', textAlign: 'center' }}>
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
