import { nanoid } from 'nanoid';
import { createContext, useContext, useState } from 'react';
import Notification, { NotificationProps } from './Notification';
import s from './Notifications.module.scss';
import Portal from './Portal';

export const contextInitial = {
	add: (n: NotificationProps) => { },
	remove: (id: string) => { },
};
export type NotificationContext = typeof contextInitial;
const context = createContext(contextInitial);

const Notifications = (props: any) => {
	const [state, setState] = useState<NotificationProps[]>([]);

	return (
		<context.Provider
			value={{
				add: (n: NotificationProps) => setState((s) =>
					// Only create a new notificate if the id doesn't already exist
					n.id && s.some(v => v.id === n.id) ? s : [{ ...n, id: n.id ?? nanoid(4), created_date: new Date() }, ...s]
				),
				remove: (id: string) => setState((s) => s.filter((n) => n.id !== id)),
			}}
		>
			{props.children}
			<Portal id={s.notifications}>
				{state.slice(0, 5).map((n) => (
					<Notification key={n.id} {...n} />
				))}
			</Portal>
		</context.Provider>
	);
};

export const useNotifications = () => useContext(context);

export default Notifications;
