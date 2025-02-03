import React, { useContext, useEffect, useRef } from 'react';
import { BiRightArrow } from 'react-icons/bi';
import { classNameFind, separateChildren } from '../utils';
import s from './Collapsible.module.scss';
import StateCombineHOC, { LCP, SCC } from './HOC/StateCombineHOC';
import Icon from './Icon';
import { useTheme } from './Theme';

export interface CollapsibleState {
	open: boolean;
}
export interface CollapsibleProps extends React.HTMLAttributes<HTMLDivElement> {
	canCollapse?: boolean;
}
const initialState: CollapsibleState = { open: false };
export const CollapsibleContext = SCC<CollapsibleState>({
	initialState: initialState,
	state: initialState,
	setState: () => undefined,
});
export const useCollapsible = () => useContext(CollapsibleContext);

const Collapsible = ({
	className,
	children,
	initialState,
	state,
	setState,
	canCollapse,
	setStateMerge,
	...props
}: LCP<CollapsibleState, CollapsibleProps>) => {
	const theme = useTheme().name;
	className = classNameFind(s, `comp`, theme, className);

	const content = useRef<HTMLDivElement>(null);

	const [child_first, child_rest, renderChild] = separateChildren(children, state, setState);

	useEffect(() => {
		if (content.current) {
			content.current.style.maxHeight = state.open
				? content.current
					? `${content.current.scrollHeight}px`
					: '0px'
				: '0px';
		}
	}, [state.open]);

	return (
		<div className={className} {...props}>
			<div
				onClick={() => {
					(canCollapse ?? true) && setStateMerge({ open: !state.open });
				}}
				className={classNameFind(s, true ? 'collapsible' : '')}
			>
				{renderChild(child_first)}
			</div>

			{(canCollapse ?? true) && state.open && (
				<div ref={content} style={{}} className={classNameFind(s, 'content')}>
					{renderChild(child_rest)}
				</div>
			)}
		</div>
	);
};

export const CollapsibleToggleIcon = (props) => {
	const collapsible = useCollapsible();
	return (
		// <Icon
		// 	{...props}
		// 	icon={BiRightArrow}
		// 	size={10}
		// 	style={{
		// 		transition: 'all .5s',
		// 		transform: `rotate(${collapsible.state.open ? '90deg' : '0'})`,
		// 		...props.style,
		// 	}}
		// ></Icon>
		null
	);
};

export default StateCombineHOC({
	comp: Collapsible,
	options: { initialState, context: CollapsibleContext, contextInitial: {} },
});
