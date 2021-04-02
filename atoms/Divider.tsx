import React, { FunctionComponent, useContext } from 'react';
import s from './Divider.module.scss';
import { useTheme } from '@catoms/Theme';
import { classNameFind } from '@common/utils';

export interface DividerProps{
	
}

const Divider: FunctionComponent<DividerProps & React.HTMLAttributes<HTMLHRElement>> = (props) => {
	const theme = useTheme().name;
	let {className,...others} = props;
	className = classNameFind(s, theme, className, `divider`)
	
	return (
		<hr className={className} {...others} />
	)
}

export default Divider;