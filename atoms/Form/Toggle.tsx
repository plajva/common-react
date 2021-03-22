import React, { FunctionComponent, useContext } from 'react';
import s from './Toggle.module.scss';
import { ThemeC } from '../../../App';
import { classNameFind } from '../../utils';
import Button from '../Button';

export interface ToggleProps {
	
}

const Toggle: FunctionComponent<ToggleProps & React.HTMLAttributes<HTMLDivElement>> = (props) => {
	const theme = useContext(ThemeC);
	let { className, ...others } = props;
	className = classNameFind(s, `toggle`, 'dup', theme, className);

	return (
		<Button></Button>
	)
}

export default Toggle;