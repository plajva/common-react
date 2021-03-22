import React, { FunctionComponent, useContext } from 'react';
import s from './ThemeClass.module.scss';
import { ThemeC } from '../../App';
import { classNameFind } from '../utils';

export interface ThemeClassProps{
	
}

const ThemeClass: FunctionComponent<ThemeClassProps & React.HTMLAttributes<HTMLDivElement>> = (props) => {
	const theme = useContext(ThemeC);
	let {className,...others} = props;
	className = classNameFind(s, `atom`, 'dup', theme, className);
	
	return (
		<div className={className} {...others}>
			{props.children}
		</div>
	)
}

export default ThemeClass;