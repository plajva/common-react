import { useTheme } from '@catoms/Theme';
import { classNameFind } from '@common/utils';
import React, { FunctionComponent } from 'react';
import Button from '../Button';
import s from './Toggle.module.scss';

export interface ToggleProps {}

const Toggle: FunctionComponent<ToggleProps & React.HTMLAttributes<HTMLDivElement>> = (props) => {
    const theme = useTheme().name;
    let { className, ...others } = props;
    className = classNameFind(s, `toggle`, 'dup', theme, className);

    return <Button></Button>;
};

export default Toggle;
