import { useContext, PropsWithChildren, useState, useRef, useEffect } from 'react';
import FocusTrap from 'focus-trap-react';

import s from './Modal.module.scss';
import { useTheme } from '@catoms/Theme';
import { classNameFind } from '@common/utils';
import Portal from './Portal';

export interface ModalProps {
    onClose?: Function;
    isOpen: boolean;
    isLocked?: boolean;
}

const Modal = (props: PropsWithChildren<ModalProps>) => {
    const theme = useTheme().name;
    const clsBack = classNameFind(s, `atom`, theme);
    const clsActive = classNameFind(s, `active`, theme);
    const clsContent = classNameFind(s, `content`, theme);

    // set up active state
    const [active, setActive] = useState(false);
    // get spread props out variables
    const { isOpen, onClose, isLocked, children } = props;
    // Make a reference to the backdrop
    const backdrop = useRef(null);

    useEffect(() => {
        // get dom element from backdrop
        const { current } = backdrop;
        // when transition ends set active state to match open prop
        const transitionEnd = () => setActive(isOpen);

        // if the backdrop exists set up listeners
        if (current) {
            current.addEventListener('transitionend', transitionEnd);
        }

        // if open props is true add inert to #root
        // and set active state to true
        if (isOpen) {
            window.setTimeout(() => {
                document.activeElement.blur();
                setActive(isOpen);
            }, 10);
        }

        // on unmount remove listeners
        return () => {
            if (current) {
                current.removeEventListener('transitionend', transitionEnd);
            }
        };
    }, [isOpen, isLocked, onClose]);

    return (
        ((isOpen || active) && (
            <Portal id='modals'>
                <FocusTrap
                    focusTrapOptions={{
                        preventScroll: true,
                        onDeactivate: () => onClose && onClose(),
                    }}
                >
                    <div ref={backdrop} className={clsBack + (active && isOpen ? ' ' + clsActive : '')}>
                        <div className={clsContent}>{children}</div>
                    </div>
                </FocusTrap>
            </Portal>
        )) ||
        null
    );
};

export default Modal;
