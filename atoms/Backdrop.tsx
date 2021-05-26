import { useTheme } from '@catoms/Theme';
import { classNameFind } from '@common/utils';
import { forwardRef, PropsWithChildren } from 'react';
import s from './Backdrop.module.scss';

export interface BackdropProp {
    active?: boolean;
}

const Backdrop = forwardRef<HTMLDivElement, PropsWithChildren<BackdropProp>>((props, ref) => {
    const theme = useTheme().name;
    const className = classNameFind(s, `atom`, props.active ? 'active' : '', theme);
    return (
        <div ref={ref} className={className}>
            {props.children}
        </div>
    );
});

export default Backdrop;
