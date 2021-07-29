import { forwardRef, HTMLAttributes, PropsWithChildren } from 'react';
import { useTheme } from './Theme';
import { classNameFind } from '../utils';
import s from './Backdrop.module.scss';

export interface BackdropProp {
    active?: boolean;
    fixed?: boolean;
}

const Backdrop = forwardRef<HTMLDivElement, PropsWithChildren<HTMLAttributes<{}> & BackdropProp>>(
    ({ active, fixed, className, children, ...props }, ref) => {
        const theme = useTheme().name;
        const cls = classNameFind(s, `atom`, active ? 'active' : '', fixed ? 'fixed' : '', className, theme);

        return (
            <div ref={ref} className={cls} {...(props || null)}>
                {children}
            </div>
        );
    }
);

export default Backdrop;
