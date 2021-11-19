import { useCallback, useEffect, useState } from 'react';
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
	value: string;
	type?: 'error' | 'warning' | 'success';
	sticky?: boolean;
}

const Notification = ({ icon, type, value, sticky, id }: NotificationProps) => {
	const [inNoty, setInNoty] = useState(false);
	
	type = type ?? 'success';

	const className = classNameFind(
		s,
		'atom margin-2 padding-1',
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
		if (!sticky) {
			t = setTimeout(remove, type === 'error' ? 20000 : type === 'warning' ? 10000 : 3000);
		}

		t_in = setTimeout(() => {
			setInNoty(true);
		}, 10);

		return () => {
			clearTimeout(t);
			clearTimeout(t_in);
		};
	}, [remove, removeNotification, sticky, type]);

	return (
		<div className={className}>
			{icon && <Icon className={cnf(s, 'icon margin-h-1')} icon={mapIcons[type]} />}

			<div className={cnf(s, 'content padding-1', icon ? 'hasIcon' : '')}>{value}</div>

			<Button button_type='icon' className={cnf(s, 'close')} onClick={remove}>
				<Icon icon={FaTimes} />
			</Button>
		</div>
	);
};

export default Notification;
