import { useTheme } from '@common/atoms/Theme';
import { isLoggedIn, token} from '@common/rxjs/rxjs_auth';
import React, { ReactElement } from 'react';

export interface LockedProps  {
	assertClaims?: string;
	assertRoles?: string;
}

/**
 * Locked if user logged out, or user claims 
 * @param 
 * @returns 
 */
export const isLocked = ({assertClaims,assertRoles}:LockedProps) => 
	!((assertClaims
		? assertClaims
				.split(' ')
				.map((x) => x.trim().toLowerCase())
				.filter(x => !!x)
				.every((c) => token.claims?.includes(c))
		: true) &&
	(assertRoles
		? assertRoles
				.split(' ')
				.map((x) => x.trim().toLowerCase())
				.filter(x => !!x)
				.every((c) => token.roles?.includes(c))
		: true)) || !isLoggedIn();

/**
 *
 * @param assertClaims -
 * @returns
 */
const Locked = ({
	className,
	assertClaims,
	assertRoles,
	children,
	...props
}: LockedProps & React.HTMLAttributes<HTMLElement> & {children: ReactElement}) => {
	const theme = useTheme().name;
	
	return isLocked({assertClaims,assertRoles}) ? null : children  ?? null;
};



export default Locked;
