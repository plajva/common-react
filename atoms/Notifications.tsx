import Portal from './Portal';
import { createContext, useContext, useReducer } from 'react';

import Notification from './Notification';
import s from './Notifications.module.scss';

interface NotificationProps {
    id?: number;
    text?: string;
    type?: 'success' | 'warning' | 'error';
    icon?: boolean;
    sticky?: boolean;
}

interface StateNotificationProps {
    notifications: Array<NotificationProps>;
}

interface ActionNotificationProps {
    type: string;
    notification: NotificationProps;
}

const reducerFunction = (state: StateNotificationProps, action: ActionNotificationProps) => {
    const newState = { ...state };

    switch (action.type) {
        case 'add':
            newState.notifications = [{ ...action.notification, id: Date.now() }, ...newState.notifications];
            break;
        case 'remove':
            newState.notifications = state.notifications.filter((notif) => notif.id !== action.notification.id);
            break;
        case 'clear':
            newState.notifications = [];
            break;
        default:
            break;
    }

    return newState;
};

const NotificationContext = createContext({
    addNotification: (notification: NotificationProps) => {},
    removeNotification: (notificationId: number) => {},
});

const Notifications = (props: any) => {
    const [state, dispatch] = useReducer(reducerFunction, { notifications: Array<NotificationProps>() });

    const addNotification = (notification: NotificationProps) => {
        dispatch({ type: 'add', notification });
    };
    const removeNotification = (notificationId: number) => {
        dispatch({ type: 'remove', notification: { id: notificationId } });
    };

    return (
        <NotificationContext.Provider
            value={{
                addNotification,
                removeNotification,
            }}
        >
            {props.children}

            <Portal id={s.notifications}>
                {state.notifications.slice(0, 5).map((noty, idx) => (
                    <Notification
                        key={idx}
                        sticky={noty.sticky}
                        id={noty.id}
                        icon={noty.icon}
                        text={noty.text || ''}
                        type={noty.type || 'success'}
                    />
                ))}
            </Portal>
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);

export default Notifications;
