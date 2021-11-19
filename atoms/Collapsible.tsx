import React, { ReactNode, useContext, useRef } from 'react';
import { BiRightArrow } from 'react-icons/bi';
import { classNameFind, separateChildren } from '../utils';
import s from './Collapsible.module.scss';
import StateCombineHOC, { StateCombineContext, StateCombineProps } from './HOC/StateCombineHOC';
import Icon from './Icon';
import { useTheme } from './Theme';

export interface CollapsibleState {
	open: boolean;
}
export interface CollapsibleProps {
	canCollapse?: boolean;
	children?: ReactNode;
}
const initialState: CollapsibleState = { open: false };
export const CollapsibleContext = StateCombineContext<CollapsibleState>({
	state: initialState,
	setState: () => {},
	initialState,
});
export const useCollapsible = () => useContext(CollapsibleContext);

const Collapsible = ({
	canCollapse,
	className,
	children,
	state,
	setState,
	initialState,
	...props
}: CollapsibleProps & StateCombineProps<CollapsibleState> & React.HTMLAttributes<HTMLDivElement>) => {
	const theme = useTheme().name;
	className = classNameFind(s, `comp`, theme, className);
	canCollapse = canCollapse ?? true;

	const content = useRef<HTMLDivElement>(null);

	const [child_first, child_rest, renderChild] = separateChildren(children, state, setState);

	return (
		<div className={className} {...props}>
			<div
				onClick={() => canCollapse && setState({ open: !state.open })}
				className={classNameFind(s, true ? 'collapsible' : '')}
			>
				{renderChild(child_first)}
			</div>

			{canCollapse && (
				<div
					ref={content}
					style={{ maxHeight: state.open ? (content.current ? content.current.scrollHeight : undefined) : 0 }}
					className={classNameFind(s, 'content')}
				>
					{renderChild(child_rest)}
				</div>
			)}
		</div>
	);
};

export const CollapsibleToggleIcon = (props) => {
	const collapsible = useCollapsible();
	return (
		<Icon
			{...props}
			icon={BiRightArrow}
			style={{
				transition: 'all .5s',
				transform: `rotate(${collapsible.state.open ? '90deg' : '0'})`,
				...props.style,
			}}
		></Icon>
	);
};

export default StateCombineHOC(Collapsible, { initialState, context: CollapsibleContext, contextExtra: {} });
