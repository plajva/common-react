import { useTheme } from './Theme';
import { classNameFind } from '../utils';
import React, { PropsWithChildren, ReactNode, useEffect, useRef, useState } from 'react';
import Backdrop from './Backdrop';
import s from './Modal.module.scss';
import Portal from './Portal';

export interface ModalProps {}
// export interface ModalState {
// 	open: boolean;
// }

const Modal = ({ children, className, ...props }: ModalProps & React.HTMLAttributes<HTMLElement>) => {
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
