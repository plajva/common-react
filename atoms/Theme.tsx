import React, { FunctionComponent, ReactElement, useContext, useEffect, useState } from 'react';
import { cnf, combineEvent } from '../utils';

export interface ThemeProviderProps {}

const themesAvailable = ['default', 'dark'];
const darkTheme = 'dark' as typeof themesAvailable[number];
const getTimeTheme = () => {
	// if (themesAvailable.length > 1 && themesAvailable.includes(darkTheme)) {
	// 	let hr = new Date().getHours();
	// 	return 7 < hr && hr < 18 ? themesAvailable[0] : darkTheme;
	// } else {
	// 	return themesAvailable[0];
	// }
	return themesAvailable[0];
};

export interface ThemeI {
	name: string;
	/** For use with scss module callback c() */
	nameWithDup: string;
	set: () => void;
	next: () => void;
}

export const ThemeContext = React.createContext<ThemeI>({
	name: getTimeTheme(),
	set: () => {},
	next: () => {},
	nameWithDup: 'dup ' + getTimeTheme(),
});

export function useTheme() {
	return useContext(ThemeContext);
}

export interface ThemeToggleProps {
	// Type ReactElement allows type checking to only have 1 valid element inside tags
	children: ReactElement;
}

export const ThemeToggle = ({ children }: ThemeToggleProps) => {
	const theme = useTheme();
	// We do this bc children will be an array always
	const child = Array.isArray(children) ? children[0] : children;
	return React.isValidElement<any>(child) ? (
		React.cloneElement(child, { onClick: combineEvent(theme.next, child.props?.onClick) })
	) : (
		<span style={{ color: 'red' }}>Theme Toggle child not element?</span>
	);
};

const ThemeProvider: FunctionComponent<ThemeProviderProps & React.HTMLAttributes<HTMLDivElement>> = ({
	children,
	...props
}) => {
	const [theme, setTheme] = useState(getTimeTheme());

	useEffect(() => {
		const int = setInterval(() => {
			setTheme(getTimeTheme());
		}, 10 ** 3 * 60 * 60 /*1 Hour*/);
		return () => {
			clearInterval(int);
		};
	}, [theme]);

	const nextTheme = () => {
		let p = themesAvailable.indexOf(theme);
		let n = ++p >= themesAvailable.length ? 0 : p;
		console.log(`Set theme ${themesAvailable[n]}`);
		setTheme(themesAvailable[n]);
	};

	return (
		<ThemeContext.Provider value={{ name: theme, nameWithDup: 'dup ' + theme, set: nextTheme, next: nextTheme }}>
			<div className={`${theme} root`}>{children}</div>
		</ThemeContext.Provider>
	);
};

export const DivThemed = (props: React.HTMLAttributes<HTMLDivElement>) => {
	const theme = useTheme();
	return <div {...props} className={cnf(undefined, theme.name, props.className)} />;
};

export default ThemeProvider;
