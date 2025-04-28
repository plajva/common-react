import { isLocked, LockedProps } from '@common/atoms/Locked';
import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

export interface PrivateElementProps extends LockedProps {
	/** Extra custom assertion */
	assert?: (() => boolean) | boolean;
	/** What to return if assertion is false, if string, will navigate */
	onAssertFalse?: string | (React.ReactElement | null);
	children?: ReactNode;
}

/**
 * @example
 * <Route element={
 * 	<PrivateElement assertRoles="admin user">
 * 		Hello Admin!
 * 	</>
 * }/>
 * @param param0
 * @returns
 */
export const PrivateElement: React.FC<PrivateElementProps> = ({ assert, onAssertFalse, children, ...locked }) => {
	const islocked = isLocked(locked);
	const valid =
		(typeof assert === 'function' ? assert() : assert ?? true) &&
		// Only take isLocked value
		(Object.values(locked).some((v) => !!v) ? !islocked : true);

	if (valid) {
		return <>{children}</>;
	}

	return typeof onAssertFalse === 'string' ? (
		<Navigate to={onAssertFalse ?? '/login'} replace />
	) : (
		onAssertFalse ?? null
	);
};

export default PrivateElement;
