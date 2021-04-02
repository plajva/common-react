import React, { FunctionComponent, useContext, useEffect, useState } from 'react';

export interface ThemeProps {}

const themesAvailable = ['default', 'dark'];
const getTimeTheme = () => {
    const darkTheme = 'dark';
    if (themesAvailable.length > 1 && themesAvailable.includes(darkTheme)) {
        let hr = new Date().getHours();
        return 7 < hr && hr < 18 ? themesAvailable[0] : darkTheme;
    } else {
        return themesAvailable[0];
    }
};

interface ThemeI {
    name: string;
    set: () => void;
    next: () => void;
}

export const ThemeContext = React.createContext<ThemeI>({ name: getTimeTheme(), set: () => {}, next: () => {} });

export function useTheme() {
    return useContext(ThemeContext);
}

const Theme: FunctionComponent<ThemeProps & React.HTMLAttributes<HTMLDivElement>> = ({ children, ...props }) => {
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
        <ThemeContext.Provider value={{ name: theme, set: nextTheme, next: nextTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export default Theme;
