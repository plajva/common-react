import React, { ReactNode } from 'react';
import { classNameFind } from '../utils';
import Backdrop from './Backdrop';
import s from './Modal.module.scss';
import Portal from './Portal';
import { useTheme } from './Theme';

export interface ModalProps extends Omit<React.HTMLAttributes<HTMLElement>, "children">{
	children: (() => any) | ReactNode;
}

const Modal = ({ children, className, ...props }: ModalProps) => {
	const _className = classNameFind(s, `atom`, 'background-background-10 padding-4', className, useTheme().name);

	return (
		<Portal id='modals'>
			<Backdrop fixed={true}>
				<div className={_className} {...props}>
					{typeof children === 'function' ? children() : children}
				</div>
			</Backdrop>
		</Portal>
	);
};

export default Modal;
