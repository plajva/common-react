import { forwardRef, HTMLAttributes, PropsWithChildren } from 'react';
import { classNameFind } from '../utils';
import s from './Backdrop.module.scss';
import { useTheme } from './Theme';

export interface BackdropProp {
	fixed?: boolean;
}

const Backdrop = forwardRef<HTMLDivElement, PropsWithChildren<HTMLAttributes<{}> & BackdropProp>>(
	({ fixed, className, children, ...props }, ref) => {
		const theme = useTheme().name;
		const cls = classNameFind(s, `atom`, fixed ? 'fixed' : '', className, theme);

		return (
			<div ref={ref} className={cls} {...(props || null)}>
				{children}
			</div>
		);
	}
);

export default Backdrop;
