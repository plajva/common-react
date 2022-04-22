import React, { FunctionComponent } from 'react';
import { classNameFind } from '../utils';
import s from './Banner.module.scss';
import { useTheme } from './Theme';

export interface BannerProps {}

const Banner: FunctionComponent<BannerProps & React.HTMLAttributes<HTMLDivElement>> = (props) => {
	const theme = useTheme().name;
	let { className, ...others } = props;
	className = classNameFind(s, `banner`, className, theme);

	return (
		<div className={className} {...others}>
			{props.children}
		</div>
	);
};

export default Banner;
