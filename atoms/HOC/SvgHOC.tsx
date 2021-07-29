import React from 'react';
import css_globals from '../../styles/globals_export.module.scss';
import { useTheme } from '../Theme';
console.log(css_globals);
type SVG_Props = React.SVGProps<SVGSVGElement> & { title?: string };
type SVG_React_Type = React.FunctionComponent<SVG_Props>;
console.log(css_globals);
export const SvgHOC = (SVG: SVG_React_Type, svgProps: (theme: any) => SVG_Props) => {
    const themeName = useTheme().name;
    const theme = css_globals.theme[themeName];
    const comp: SVG_React_Type = (props) => {
        return <SVG {...props} {...svgProps(theme)} />;
    };
    return comp;
};
