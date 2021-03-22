import React, { FunctionComponent, ReactElement, useContext } from 'react';
import s from './Icon.module.scss';
import { ThemeC } from '../../App';
import { classNameFind } from '../utils';
import { IconType } from 'react-icons';
import { IconBaseProps } from 'react-icons/lib';

export interface IconProps {
	icon: IconType
}

const Icon: FunctionComponent<IconProps & IconBaseProps> = (props) => {
	const theme = useContext(ThemeC);
	let { className, icon: IconI, ...others } = props;
	className = classNameFind(s, `atom`, 'dup', theme, className);

	return (
		
		<IconI className={className} {...others}> {props.children} </IconI>
		
		// <div style={{ width: size, height: size }} className={className} {...others}>
		// 	<IconI />
		// 	{props.children}
		// </div>
	)
}

export default Icon;