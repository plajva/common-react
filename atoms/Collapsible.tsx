import React, { FunctionComponent, ReactNode, MouseEvent, useContext, useRef, useState } from 'react';
import s from './Collapsible.module.scss';
import { useTheme } from '@catoms/Theme';
import { classNameFind } from '@common/utils';

export interface CollapsibleProps {
    in?: Boolean;
}

// First child can be function (open)

const Collapsible: FunctionComponent<CollapsibleProps & React.HTMLAttributes<HTMLDivElement>> = ({
    className,
    children,
    in: isOpen,
    ...props
}) => {
    const theme = useTheme().name;
    className = classNameFind(s, `comp`, theme, className);
    const content = useRef<HTMLDivElement>(null);

    return (
        <div className={className} {...props}>
            <div
                ref={content}
                style={{ maxHeight: isOpen ? (content.current ? content.current.scrollHeight : undefined) : 0 }}
                className={classNameFind(s, 'content')}
            >
                {children}
            </div>
        </div>
    );
};

export default Collapsible;
