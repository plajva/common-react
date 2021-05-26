import { useTheme } from '@catoms/Theme';
import { classNameFind } from '@common/utils';
import React from 'react';
import s from './Input.module.scss';

export interface InputProps {
    // value?: any,
    // type?: string,
    // onClick?: any,
}

const Input = React.forwardRef<HTMLInputElement, InputProps & React.InputHTMLAttributes<HTMLInputElement>>(
    (props, ref) => {
        const theme = useTheme().name;
        let { className, children, ...others } = props;
        className = classNameFind(s, `atom`, 'dup', theme, className);

        return <input ref={ref} className={className} {...others} />;
    }
);

export default Input;
