import moment from 'moment';
import React from 'react';
import { classNameFind } from '../../utils';
import { useTheme } from '../Theme';
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
		if (_props.type === 'date' && props.value) {
			const v = moment(props.value);
			if (v) props.value = v.format('YYYY-MM-DD');
		}

		return <input ref={ref} className={className} {...props} />;
	}
);

export default Input;
