import { useTheme } from './Theme';
import { classNameFind } from '../utils';
import React, { FunctionComponent } from 'react';
import s from './Image.module.scss';

export interface ImageProps {}

const Image: FunctionComponent<ImageProps & React.ImgHTMLAttributes<HTMLImageElement>> = (props) => {
    const theme = useTheme().name;
    let { className, alt, ...others } = props;
    className = classNameFind(s, theme, className, `image`);

    return (
        <img className={className} alt={alt ? alt : ''} {...others}>
            {props.children}
        </img>
    );
};

export default Image;
