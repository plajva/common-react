import React, { FunctionComponent, useContext } from 'react';
import s from './Toggle.module.scss';
import { useTheme } from '@catoms/Theme';
import { classNameFind } from '@common/utils';
import Button from '../Button';

export interface ToggleProps {}

const Toggle: FunctionComponent<ToggleProps & React.HTMLAttributes<HTMLDivElement>> = (props) => {
    const theme = useTheme().name;
    let { className, ...others } = props;
    className = classNameFind(s, `toggle`, 'dup', theme, className);

    return <Button></Button>;
};

export default Toggle;
