import { useEffect, useState } from 'react';
import { FaExclamation, FaCheck, FaBomb, FaTimes } from 'react-icons/fa';

import { useTheme } from './Theme';
import { classNameFind } from '../utils';
import { useNotifications } from './Notifications';
import Icon from './Icon';
import s from './Notification.module.scss';

const mapIcons = {
    error: <FaBomb />,
    warning: <FaExclamation />,
    success: <FaCheck />,
};

export interface NotificationProps {
    id?: number;
    icon?: boolean;
    text: string;
    type: 'error' | 'warning' | 'success';
    sticky?: boolean;
}

const Notification = (props: NotificationProps) => {
    const { icon, type, text, sticky } = props;
    const { name: theme } = useTheme();
    const [inNoty, setInNoty] = useState(false);

    const cls = classNameFind(s, 'atom', icon ? 'atom-icon' : '', inNoty ? 'in' : '', type, theme);
    const contentCls = classNameFind(s, 'content', !icon ? 'hasIcon' : '', theme);
    const iconCls = classNameFind(s, 'close-icon');

    const { removeNotification } = useNotifications();

    const closeNotification = () => {
        setInNoty(false);
        setTimeout(() => {
            removeNotification(props.id || 0);
        }, 300);
    };

    useEffect(() => {
        let timeout: any;
        let timeoutIn: any;
        if (!sticky) {
            timeout = setTimeout(() => closeNotification(), 3000);
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
            {!icon && <div className={s.icon}>{mapIcons[type]}</div>}
            <div className={contentCls}>
                <p>{text}</p>
            </div>
            <div className={s.close}>
                <Icon className={iconCls} icon={FaTimes} onClick={closeNotification} />
            </div>
        </div>
    );
};

export default Notification;
