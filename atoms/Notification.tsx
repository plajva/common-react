import { useEffect, useState } from 'react';
import { FaBomb, FaCheck, FaExclamation, FaTimes } from 'react-icons/fa';
import { classNameFind, cnf } from '../utils';
import Icon from './Icon';
import s from './Notification.module.scss';
import { useNotifications } from './Notifications';
import { useTheme } from './Theme';
import Button from './Button';

const mapIcons = {
	error: FaBomb,
	warning: FaExclamation,
	success: FaCheck,
};

export interface NotificationProps {
	id?: string;
	icon?: boolean;
	text: string;
	type: 'error' | 'warning' | 'success';
	sticky?: boolean;
}

const Notification = (props: NotificationProps) => {
	const { icon, type, text, sticky } = props;
	const { name: theme } = useTheme();
	const [inNoty, setInNoty] = useState(false);

	const cls = classNameFind(
		s,
		'atom margin-2 padding-1',
		icon ? 'atom-icon' : '',
		inNoty ? 'in' : '',
		type,
		'dup',
		theme
	);
	const contentCls = classNameFind(s, 'content padding-1', icon ? 'hasIcon' : '');
	// const iconCls = classNameFind(s, 'close-icon');

	const { removeNotification } = useNotifications();

	const closeNotification = () => {
		setInNoty(false);
		setTimeout(() => {
			removeNotification(props.id || '0');
		}, 300);
	};

	useEffect(() => {
		let timeout: any;
		let timeoutIn: any;
		if (!sticky) {
			timeout = setTimeout(() => closeNotification(), type === 'error' ? 20000 : type === 'warning' ? 10000 : 3000);
		}

		timeoutIn = setTimeout(() => {
			setInNoty(true);
		}, 10);

		return () => {
			clearTimeout(timeout);
			clearTimeout(timeoutIn);
		};
	}, []);

	return (
		<div className={cls}>
			{icon && <Icon className={cnf(s, 'icon margin-h-1')} icon={mapIcons[type]} />}
			<div className={contentCls}>{text}</div>
			<Button button_type='icon' className={cnf(s, 'close')} onClick={closeNotification}>
				<Icon icon={FaTimes} />
			</Button>
		</div>
	);
};

export default Notification;
