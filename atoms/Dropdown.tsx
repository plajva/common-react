import React, { FunctionComponent, ReactNode, useContext } from 'react';
import s from './Dropdown.module.scss';
import { useTheme } from '@catoms/Theme';
import { classNameFind } from '@common/utils';

export interface DropdownProps {}

const Dropdown: FunctionComponent<DropdownProps & React.HTMLAttributes<HTMLDivElement>> = ({
    className,
    children,
    ...props
}) => {
    const theme = useTheme().name;
    className = classNameFind(s, `comp`, theme, className, 'dropdown');

    const _children = React.Children.toArray(children);
    let child_first: ReactNode;
    if (_children.length) {
        child_first = _children.splice(0, 1);
    }
    const child_rest = _children;

    return (
        <div className={className} {...props}>
            <div className={classNameFind(s, 'dropbtn')}>{child_first}</div>
            <div className={classNameFind(s, 'dropdown-content')}>{child_rest}</div>
        </div>
    );
};

export default Dropdown;
