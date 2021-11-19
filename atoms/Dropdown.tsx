import { useTheme } from './Theme';
import { classNameFind, separateChildren } from '../utils';
import React, { FunctionComponent, useState } from 'react';
import s from './Dropdown.module.scss';

export interface DropdownProps {
	/**Wether to use css hover or javascript, true for javascript*/
	on_click?: boolean;
	/**Wether to handle click or not */
	handle_click?: boolean;
	contentProps?: React.HTMLAttributes<HTMLDivElement>;
}
/**
 * Gets two children either functions or components, if functions, then call with (state, setState) arguments
 * @param param0
 */
const Dropdown: FunctionComponent<DropdownProps & React.HTMLAttributes<HTMLDivElement>> = ({
	className,
	on_click,
	handle_click: _handle_click,
	children,
	contentProps,
	...props
}) => {
	const theme = useTheme().name;
	const [state, setState] = useState({ open: on_click ? false : true });
	className = classNameFind(s, `comp`, theme, className, 'dropdown');

	// Default to true if handleclick is undefined
	const handle_click = _handle_click ?? true;

	const [child_first, child_rest, renderChild] = separateChildren(children, state, setState);

	return (
		<div className={className} {...props}>
			<div
				className={classNameFind(s, 'dropbtn')}
				onClick={on_click && handle_click ? () => setState({ open: !state.open }) : undefined}
			>
				{renderChild(child_first)}
			</div>

			{state.open && child_rest?.some((s) => Boolean(s)) && (
				<div
					{...contentProps}
					className={classNameFind(
						s,
						'dropdown-content',
						!on_click ? 'dropdown-content-hover' : '',
						contentProps?.className
					)}
				>
					{renderChild(child_rest)}
				</div>
			)}
		</div>
	);
};

export default Dropdown;
