import React, { FunctionComponent } from 'react';
import { IconType } from 'react-icons';
import { IconBaseProps } from 'react-icons/lib';
import { classNameFind } from '../utils';
import s from './Icon.module.scss';
import { useTheme } from './Theme';

export interface IconProps {
	icon: IconType;
}

const Icon: FunctionComponent<IconProps & IconBaseProps> = (props) => {
	const theme = useTheme().name;
	let { className, icon: IconI, ...others } = props;
	className = classNameFind(s, `atom`, 'dup', theme, className);

	return (
		<IconI className={className} {...others}>
			{' '}
			{props.children}{' '}
		</IconI>

		// <div style={{ width: size, height: size }} className={className} {...others}>
		// 	<IconI />
		// 	{props.children}
		// </div>
	);
};

export default Icon;
