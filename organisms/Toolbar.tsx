import { useTheme } from '../atoms/Theme';
import { classNameFind } from '../utils';
import { ReactElement, ReactNode } from 'react';
import s from './Toolbar.module.scss';

export interface ToolbarProps {
	left?: ReactNode;
	middle?: ReactNode;
	right?: ReactNode;
}

const Toolbar: (props: ToolbarProps) => ReactElement = ({ left, middle, right, ...props }) => {
	const theme = useTheme().name;
	// let {className,...others} = props;
	let className = classNameFind(s, theme, `toolbar`);

	return (
		<div className={className}>
			{left}
			<div style={{ flex: '4 1 auto' }}></div>
			{middle}
			<div style={{ flex: '4 1 auto' }}></div>
			{right}
		</div>
	);
};

export default Toolbar;
