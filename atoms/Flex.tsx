import React, { FunctionComponent, useContext } from 'react';
import s from './Flex.module.scss';
import { useTheme } from '@catoms/Theme';
import { classNameFind } from '@common/utils';

export interface FlexProps {
    gap;
}

const Flex: FunctionComponent<FlexProps & React.HTMLAttributes<HTMLElement>> = (props) => {
    const theme = useTheme().name;
    let { className, ...others } = props;
    className = classNameFind(s, `atom`, 'dup', theme, className);

    return (
        <div className={className} {...others}>
            {props.children}
        </div>
    );
};

export default Flex;
