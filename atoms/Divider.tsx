import React, { FunctionComponent } from 'react';
import { classNameFind } from '../utils';
import s from './Divider.module.scss';
import { useTheme } from './Theme';

export interface DividerProps {}

const Divider: FunctionComponent<DividerProps & React.HTMLAttributes<HTMLHRElement>> = (props) => {
	const theme = useTheme().name;
	let { className, ...others } = props;
	className = classNameFind(s, theme, className, `divider`);

	return <hr className={className} {...others} />;
};

export default Divider;
