import React, { FunctionComponent, ReactNode, MouseEvent, useContext, useRef, useState } from 'react';
import s from './Collapsible.module.scss';
import { ThemeC } from '../../App';
import { classNameFind } from '../utils';

export interface CollapsibleProps{
	
}

// First child can be function (open)

const Collapsible: FunctionComponent<CollapsibleProps & React.HTMLAttributes<HTMLDivElement>> = ({className, children,...props}) => {
	const theme = useContext(ThemeC);
	className = classNameFind(s, `comp`, theme, className);
	const [state, setState] = useState({open: false});
	const content = useRef<HTMLDivElement>(null);
	
	const _children = React.Children.toArray(children);
	let child_first;
	if (_children.length) {
		child_first = _children.splice(0, 1);
	}
	const child_rest = _children;
	
	const toggle = (e:MouseEvent<HTMLElement>) => {
		setState({open: !state.open})
		// if(content.current){
		// 	content.current.style.maxHeight = content.current.scrollHeight + 'px';
		// }
	}
	
	return (
		<div className={className} {...props}>
			<div onClick={toggle} className={classNameFind(s, 'collapsible')} >{typeof child_first === 'function'? child_first(state):child_first}</div>
			<div 
			ref={content} 
			style={{maxHeight: state.open ? (content.current ? content.current.scrollHeight : undefined) : 0}} 
			className={classNameFind(s, 'content')}>
				{child_rest}
			</div>
		</div>
	)
}

export default Collapsible;