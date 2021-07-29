import { useTheme } from '../Theme';
import { classNameFind } from '../../utils';
import React from 'react';
import { FieldCommon } from './Field';
import { useFormField } from './Form';
import s from './Input.module.scss';

export interface InputProps extends FieldCommon {
    // value?: any,
    // type?: string,
    // onClick?: any,
}

const Input = React.forwardRef<HTMLInputElement, InputProps & React.InputHTMLAttributes<HTMLInputElement>>(
    ({ className, children, ..._props }, ref) => {
        const theme = useTheme().name;
        className = classNameFind(s, `atom`, 'dup', theme, className);
        // if(_props.name==='household.size')console.log(_props.name)
        const props = useFormField(_props);

        return <input ref={ref} className={className} {...props} />;
    }
);

export default Input;
