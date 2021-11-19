import { nanoid } from 'nanoid';
import { createContext, useContext, useReducer, useState } from 'react';
import Notification, { NotificationProps } from './Notification';
import s from './Notifications.module.scss';
import Portal from './Portal';

const NotificationContext = createContext({
	add: (n: NotificationProps) => {},
	remove: (id: string) => {},
});

const Notifications = (props: any) => {
	const [state, setState] = useState<NotificationProps[]>([]);

	return (
		<NotificationContext.Provider
			value={{
				add: (n: NotificationProps) => setState((s) => [{ ...n, id: nanoid(4) }, ...s]),
				remove: (id: string) => setState((s) => s.filter((n) => n.id !== id)),
			}}
		>
			{props.children}
			<Portal id={s.notifications}>
				{state.slice(0, 5).map((n) => (
					<Notification key={n.id} {...n} />
				))}
			</Portal>
		</NotificationContext.Provider>
	);
};

export const useNotifications = () => useContext(NotificationContext);

export default Notifications;
