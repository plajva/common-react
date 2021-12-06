/**! Not using this anymore */
/**
 * Deleted PrivateRoute, only is PrivateElement now, previous private route wasn't working with 'component' prop
 */
import React from 'react';
import { Navigate } from 'react-router-dom';

export interface PrivateElementProps {
	assert: () => boolean;
	onAssertFalse?: string | (React.ReactElement | null);
}

export const PrivateElement: React.FC<PrivateElementProps> = ({ assert, onAssertFalse, children }) => {
	const valid = assert();

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
