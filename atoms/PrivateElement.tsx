/**! Not using this anymore */
/**
 * Deleted PrivateRoute, only is PrivateElement now, previous private route wasn't working with 'component' prop
 */
import { isLocked, LockedProps } from '@common/atoms/Locked';
import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

export interface PrivateElementProps extends LockedProps {
	assert?: (() => boolean) | boolean;
	onAssertFalse?: string | (React.ReactElement | null);
	children?: ReactNode;
}

export const PrivateElement: React.FC<PrivateElementProps> = ({ assert, onAssertFalse, children, ...locked }) => {
	const islocked = isLocked(locked);
	const valid =
		(typeof assert === 'function' ? assert() : assert ?? true) &&
		// Only take isLocked value
		(Object.values(locked).some((v) => !!v) ? !islocked : true);

	if (valid) {
		return <>{children}</> ?? null;
	}

	return typeof onAssertFalse === 'string' || typeof onAssertFalse === 'undefined' ? (
		<Navigate to={onAssertFalse ?? '/login'} />
	) : (
		onAssertFalse ?? null
	);
};

export default PrivateElement;
