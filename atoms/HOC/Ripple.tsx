import React, { FunctionComponent, useContext, MouseEvent, ComponentType } from 'react';
import s from './Ripple.module.scss';
// import { useTheme } from '@catoms/Theme';
import { classNameFind, combineEvent } from '@common/utils';

export interface RippleProps {
    ripple_type?: 'normal' | 'center';
    // Time in ms
    ripple_time?: number;
}

/**
 * Injects a ripple effect to the onClick handler of the element
 * @param props
 */
const Ripple = <T extends React.HTMLAttributes<HTMLElement>>(
    Comp: ComponentType<T>,
    props?: RippleProps
): FunctionComponent<T & RippleProps> => {
    // Sets defaults
    const rprops_d: RippleProps = { ripple_type: 'normal', ripple_time: 500, ...props };

    const createRipple = (e: MouseEvent<HTMLElement>, rprops: RippleProps) => {
        const parent = e.currentTarget;
        const parentRect = parent.getBoundingClientRect();

        const new_ripple = document.createElement('span');
        const diameter = Math.max(parentRect.width, parentRect.height);
        const radius = diameter / 2;

        new_ripple.style.width = new_ripple.style.height = `${diameter}px`;
        switch (rprops.ripple_type) {
            case 'center':
                new_ripple.style.left = `calc(50% - ${radius}px)`;
                new_ripple.style.top = `calc(50% - ${radius}px)`;
                break;
            default:
                new_ripple.style.left = `${e.clientX - (parentRect.left + radius)}px`;
                new_ripple.style.top = `${e.clientY - (parentRect.top + radius)}px`;
                break;
        }

        new_ripple.style.animation = `${s['ripple']} ${rprops.ripple_time}ms linear forwards`;
        new_ripple.className = `${s['ripple']}`;

        // let ripple = parent.getElementsByClassName(s['ripple'])[0] as HTMLSpanElement;
        // if (ripple) {
        // 	ripple.remove();
        // }
        parent.appendChild(new_ripple);

        // Remove ripple after anim
        setTimeout(() => {
            new_ripple.remove();
        }, rprops.ripple_time);
    };
    const ripple = ({ onClick, ...props }: T) => (
        <Comp
            {...(props as T)}
            onClick={combineEvent((e: any) => createRipple(e, { ...rprops_d, ...props }), onClick)}
        />
    );
    return ripple;
};

export default Ripple;
