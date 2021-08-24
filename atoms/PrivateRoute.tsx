/**
 * Updated private route, previous private route wasn't working with 'component' prop
 */
import React, { ReactNode, ElementType } from "react";
import { Route, Redirect } from "react-router-dom";

export interface PrivateRouteProps {
	component?: ElementType;
	children?: ReactNode;
	assert: () => boolean;
	onAssertFalse?: string | ElementType;
	[key: string]: any;
}
const PrivateRoute = ({ component: Component, children, assert, onAssertFalse, ...rest }: PrivateRouteProps) => {
	return (
		// Show the component or children only when assert is true
		// Otherwise, redirect the user to /signin page
		<Route
			{...rest}
			render={(props) =>
				assert() ? (
					Component ? (
						<Component {...props} />
					) : (
						children
					)
				) : typeof onAssertFalse === "string" ? (
					<Redirect to={onAssertFalse ? onAssertFalse : "/login"} />
				) : (
					onAssertFalse
				)
			}
		/>
	);
};

export default PrivateRoute;
