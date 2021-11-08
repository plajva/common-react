/**! Not using this anymore */
/**
 * Updated private route, previous private route wasn't working with 'component' prop
 */
import React from "react";
import { Route, Navigate, IndexRouteProps, LayoutRouteProps, PathRouteProps } from "react-router-dom";

export interface PrivateRouteProps {
	assert: () => boolean;
	onAssertFalse?: string | (React.ReactElement | null);
}
const PrivateRoute = ({ element, assert, onAssertFalse, ...rest }: PrivateRouteProps & (PathRouteProps | LayoutRouteProps | IndexRouteProps)) => {
	const children = assert() ? (
		element
	) : typeof onAssertFalse === "string" || !onAssertFalse ? (
		<Navigate to={onAssertFalse ?? "/login"} />
	) : (
		onAssertFalse
	)
	
	return (
		// Show the component or children only when assert is true
		// Otherwise, redirect the user to /signin page
		<Route
			{...rest}
			element={children}
		/>
	);
};

export default PrivateRoute;
