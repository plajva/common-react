import { useCallback, useEffect, useState } from 'react';
import { FaBomb, FaCheck, FaExclamation, FaTimes } from 'react-icons/fa';
import { classNameFind, cnf } from '../utils';
import Button from './Button';
import Icon from './Icon';
import s from './Notification.module.scss';
import { useNotifications } from './Notifications';
import { useTheme } from './Theme';

const mapIcons = {
	error: FaBomb,
	warning: FaExclamation,
	success: FaCheck,
};

export interface NotificationProps {
	id?: string;
	icon?: boolean;
	created_date: Date,
	// The text the notitification has
	value?: string;
	type?: 'error' | 'warning' | 'success';
	// In ms
	timeout?: number;
	action?: () => void;
}

const Notification = ({ icon, type, value, timeout, id, created_date, action }: NotificationProps) => {
	const [inNoty, setInNoty] = useState(false);

	timeout = timeout ?? (type === 'error' ? 20000 : type === 'warning' ? 10000 : 5000);

	type = type ?? 'success';

	const className = classNameFind(
		s,
		'atom margin-2',
		icon ? 'atom-icon' : '',
		inNoty ? 'in' : '',
		type,
		'dup',
		useTheme().name
	);

	const { remove: removeNotification } = useNotifications();

	const remove = useCallback(() => {
		setInNoty(false);
		setTimeout(() => {
			removeNotification(id || '0');
		}, 300);
	}, [removeNotification, id]);

	useEffect(() => {
		let t: any;
		let t_in: any;
		if (timeout && timeout > 0) {
			t = setTimeout(remove, timeout);
		}

		t_in = setTimeout(() => {
			setInNoty(true);
		}, 10);

		return () => {
			clearTimeout(t);
			clearTimeout(t_in);
		};
	}, [remove, removeNotification, timeout, type]);

	return (
		<div className={className}>
			{icon && <Icon className={cnf(s, 'icon margin-h-1')} icon={mapIcons[type]} />}

			<div className={cnf(s, 'content padding-1', icon ? 'hasIcon' : '')}>{value}</div>

			{action && (
				<Button button_type='icon' className={cnf(s, 'close')} onClick={action}>
					<Icon icon={FaCheck} />
				</Button>
			)}
			<Button button_type='icon' className={cnf(s, 'close')} onClick={remove}>
				<Icon icon={FaTimes} />
			</Button>
		</div>
	);
};

export default Notification;
