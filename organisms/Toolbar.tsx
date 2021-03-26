import React, { FunctionComponent, ReactNode, useContext } from 'react';
import { Link, LinkProps } from 'react-router-dom';
import Image from '../atoms/Image';
import s from './Toolbar.module.scss';
import Button from '../atoms/Button';
import { useTheme } from '@catoms/Theme';
import { classNameFind } from '@common/utils';

// We want to -> have a chosen theme variable

export interface ToolbarProps {
	left?: ReactNode,
	middle?: ReactNode,
	right?:ReactNode,
}

// const Link: FunctionComponent<LinkProps> = (props) => {
// 	return (
// 		// <div>
// 			<Link to={props.to}>{props.children}</Link>
// 		// {/* </div> */}
// 	)
// }



const Toolbar:FunctionComponent<ToolbarProps> = ({left,middle, right, ...props}) => {
	const theme = useTheme().name;
	// let {className,...others} = props;
	let className = classNameFind(s, theme, `toolbar`)
	
	return (
		<div className={className}>
			{left}
			<div style={{flexGrow: 4}}></div>
			{middle}
			<div style={{flexGrow: 4}}></div>
			{right}
			{props.children}
			
		</div>
	);
}

export default Toolbar;