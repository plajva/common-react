import React, { FunctionComponent, useContext } from 'react';
import s from './Input.module.scss';
import { ThemeC } from '../../../App';
import { classNameFind } from '../../utils';

export interface InputProps{
	// value?: any,
	// type?: string,
	// onClick?: any,
}



const Input = React.forwardRef<HTMLInputElement, InputProps & React.InputHTMLAttributes<HTMLInputElement>>((props, ref) => {
	const theme = useContext(ThemeC);
	let {className, children,...others} = props;
	className = classNameFind(s, `atom`, 'dup', theme, className);
	
	return (
		<input ref={ref} className={className} {...others} />
	)
})

export default Input;