/**! Not using this anymore */
/**
 * Updated private route, previous private route wasn't working with 'component' prop
 */
import React from "react";
import { Route, Navigate, IndexRouteProps, LayoutRouteProps, PathRouteProps, Outlet } from "react-router-dom";

export interface PrivateRouteProps {
	assert: () => boolean;
	onAssertFalse?: string | (React.ReactElement | null);
}
/**
 * ! Depracated, use PrivateOutlet instead like this:
 * 			<Route path="/private-outlet" element={<PrivateOutlet />}>
          <Route element={<Private />} />
        </Route>
 * @param param0 
 * @returns 
 */
// const PrivateRoute = ({ element, assert, onAssertFalse, ...rest }: PrivateRouteProps & (PathRouteProps | LayoutRouteProps | IndexRouteProps)) => {
// 	const children = assert() ? (
// 		element
// 	) : typeof onAssertFalse === "string" || !onAssertFalse ? (
// 		<Navigate to={onAssertFalse ?? "/login"} />
// 	) : (
// 		onAssertFalse
// 	)
	
// 	return (
// 		// Show the component or children only when assert is true
// 		// Otherwise, redirect the user to /signin page
// 		<Route
// 			{...rest}
// 			element={children}
// 		/>
// 	);
// };
// export const PrivateOutlet = ({assert, onAssertFalse, children} : PrivateRouteProps & {children?}) => {
// 	return assert() ? (
// 		<Outlet /> ?? children
// 	) : typeof onAssertFalse === "string" || !onAssertFalse ? (
// 		<Navigate to={onAssertFalse ?? "/login"} />
// 	) : (
// 		onAssertFalse
// 	);
// }

type PrivateProps = PrivateRouteProps & (PathRouteProps | LayoutRouteProps | IndexRouteProps);

export const PrivateElement: React.FC<PrivateRouteProps> = ({ assert, onAssertFalse, children }) => {
  const valid = assert();

  if (valid) {
    return <>{children}</> ?? null
  }

  return typeof onAssertFalse === "string" || !onAssertFalse ? (
		<Navigate to={onAssertFalse ?? "/login"} />
	) : (
		onAssertFalse ?? null
	)
}

// export const PrivateRoute: React.FC<PrivateProps> = ({ element, assert, onAssertFalse, ...rest }) => {
//   console.log('Returning private route')
  // return <Route {...rest} element={<PrivateElement children={element} assert={assert} onAssertFalse={onAssertFalse}  />} />
// }

// export const PrivateOutletHOC = () => {
// 	return 
// }

// export default PrivateRoute;
