import React, { FunctionComponent, useContext } from 'react';
import s from './GroupClose.module.scss';
import { useTheme } from '@catoms/Theme';
import { classNameFind } from '@common/utils';

export interface GroupCloseProps{
	
}

const GroupClose: FunctionComponent<GroupCloseProps & React.HTMLAttributes<HTMLDivElement>> = (props) => {
	const theme = useTheme().name;
	let {className,...others} = props;
	className = classNameFind(s, `atom`, 'dup', theme, className);
	
	return (
		<div className={className} {...others}>
			{props.children}
		</div>
	)
}

export default GroupClose;