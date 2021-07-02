import { useTheme } from '@catoms/Theme';
import { classNameFind } from '@common/utils';
import FocusTrap from 'focus-trap-react';
import { PropsWithChildren, useEffect, useRef, useState } from 'react';
import Backdrop from './Backdrop';
import s from './Modal.module.scss';
import Portal from './Portal';

export interface ModalProps {
    className?: string;
    isOpen: boolean;
    isLocked?: boolean;
    onClose?: Function;
}

const Modal = (props: PropsWithChildren<ModalProps>) => {
    // set up active state
    const [active, setActive] = useState(false);
    // get spread props out variables
    const { isOpen, onClose, isLocked, children, className } = props;
    // Make a reference to the backdrop
    const backdrop = useRef<HTMLDivElement>(null);

    const theme = useTheme().name;
    const clsContent = classNameFind(s, `atom`, isOpen && active ? 'active' : '', className, theme);

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
                setActive(isOpen);
            }, 10);
        }

        // on unmount remove listeners
        return () => {
            if (current) {
                current.removeEventListener('transitionend', transitionEnd);
            }
        };
    }, [isOpen]);

    return (
        ((isOpen || active) && (
            <Portal id='modals'>
                <FocusTrap
                    focusTrapOptions={{
                        preventScroll: true,
                        onDeactivate: () => !isLocked && onClose && onClose(),
                    }}
                >
                    <Backdrop ref={backdrop} active={isOpen} fixed={true}>
                        <div className={clsContent}>
                            <div className={s.content}>{children}</div>
                        </div>
                    </Backdrop>
                </FocusTrap>
            </Portal>
        )) ||
        null
    );
};

export default Modal;
