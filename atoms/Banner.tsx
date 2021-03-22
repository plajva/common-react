import React, { FunctionComponent, useContext } from 'react';
import s from './Banner.module.scss';
import { ThemeC } from '../../App';
import { classNameFind } from '../utils';

export interface BannerProps{
	
}

const Banner: FunctionComponent<BannerProps & React.HTMLAttributes<HTMLDivElement>> = (props) => {
	const theme = useContext(ThemeC);
	let {className,...others} = props;
	className = classNameFind(s, `banner`, className, theme);
	
	return (
		<div className={className} {...others}>
			{props.children}
		</div>
	)
}

export default Banner;