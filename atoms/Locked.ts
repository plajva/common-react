import { isLoggedIn, token } from '@common/rxjs/rxjs_auth';
import React, { ReactElement } from 'react';

export interface LockedProps {
	assertClaims?: string;
	assertRoles?: string;
}

const toAssertion = (rule: string | undefined, array: string[] | undefined) =>
	rule
		? rule
				.split(' ')
				.map((v) =>
					v
						.split('|')
						.map((x) => x.trim().toLowerCase())
						.filter((x) => !!x)
				)
				.every((c) => c.some((c) => array?.includes(c)))
		: true;
/**
 * Locked if user logged out, or user/claims doesn't contain assertClaims/assertRoles passed
 * @returns boolean
 */
export const isLocked = ({ assertClaims, assertRoles }: LockedProps) =>
	!(toAssertion(assertClaims, token.claims) && toAssertion(assertRoles, token.roles)) || !isLoggedIn();

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
