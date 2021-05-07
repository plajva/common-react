import React, { FunctionComponent, ReactNode, MouseEvent, useContext, useRef, useState } from 'react';
import s from './Collapsible.module.scss';
import { useTheme } from '@catoms/Theme';
import { classNameFind, separateChildren, setDefault } from '@common/utils';

export interface CollapsibleProps {
    canCollapse?: boolean;
}

// First child can be function (open)

const Collapsible: FunctionComponent<CollapsibleProps & React.HTMLAttributes<HTMLDivElement>> = ({
    canCollapse: _canCollapse,
    className,
    children,
    ...props
}) => {
    const theme = useTheme().name;
    className = classNameFind(s, `comp`, theme, className);
    const [state, setState] = useState({ open: false });
    const content = useRef<HTMLDivElement>(null);
    // Setting default for canCollapse
    const canCollapse = setDefault(_canCollapse, true);

    const [child_first, child_rest, renderChild] = separateChildren(children, state, setState);

    const toggle = (e: MouseEvent<HTMLElement>) => {
        if (!canCollapse) return;
        setState({ open: !state.open });
        // if(content.current){
        // 	content.current.style.maxHeight = content.current.scrollHeight + 'px';
        // }
    };

    return (
        <div className={className} {...props}>
            <div onClick={toggle} className={classNameFind(s, canCollapse ? 'collapsible' : '')}>
                {renderChild(child_first)}
            </div>
            <div
                ref={content}
                style={{ maxHeight: state.open ? (content.current ? content.current.scrollHeight : undefined) : 0 }}
                className={classNameFind(s, 'content')}
            >
                {renderChild(child_rest)}
            </div>
        </div>
    );
};

export default Collapsible;
