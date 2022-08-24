import { isLoggedIn, token } from '@common/rxjs/rxjs_auth';
import React, { ReactElement } from 'react';

export interface LockedProps {
	assertClaims?: string;
	assertRoles?: string;
}

/**
 * Locked if user logged out, or user/claims doesn't contain assertClaims/assertRoles passed
 * @returns boolean
 */
export const isLocked = ({ assertClaims, assertRoles }: LockedProps) =>
	!(
		(assertClaims
			? assertClaims
					.split(' ')
					.map((x) => x.trim().toLowerCase())
					.filter((x) => !!x)
					.every((c) => token.claims?.includes(c))
			: true) &&
		(assertRoles
			? assertRoles
					.split(' ')
					.map((x) => x.trim().toLowerCase())
					.filter((x) => !!x)
					.every((c) => token.roles?.includes(c))
			: true)
	) || !isLoggedIn();

/**
 * Same as: isLocked({assertClaims,assertRoles}) ? null : (children ?? null)
 * @returns
 */
const Locked = ({
	className,
	assertClaims,
	assertRoles,
	children,
	...props
}: LockedProps & React.HTMLAttributes<HTMLElement> & { children: ReactElement }) =>
	isLocked({ assertClaims, assertRoles }) ? null : children ?? null;

export default Locked;
