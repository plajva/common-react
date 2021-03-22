import React, { FunctionComponent, useContext } from 'react';
import s from './Divider.module.scss';
import { ThemeC } from '../../App';
import { classNameFind } from '../utils';

export interface DividerProps{
	
}

const Divider: FunctionComponent<DividerProps & React.HTMLAttributes<HTMLHRElement>> = (props) => {
	const theme = useContext(ThemeC);
	let {className,...others} = props;
	className = classNameFind(s, theme, className, `divider`)
	
	return (
		<hr className={className} {...others} />
	)
}

export default Divider;