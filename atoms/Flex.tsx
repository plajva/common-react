import React, { FunctionComponent, useContext } from 'react';
import s from './Flex.module.scss';
import { ThemeC } from '../../App';
import { classNameFind } from '../utils';

export interface FlexProps{
	gap,
	
}

const Flex: FunctionComponent<FlexProps & React.HTMLAttributes<HTMLElement>> = (props) => {
	const theme = useContext(ThemeC);
	let {className,...others} = props;
	className = classNameFind(s, `atom`, 'dup', theme, className);
	
	return (
		<div className={className} {...others}>
			{props.children}
		</div>
	)
}

export default Flex;