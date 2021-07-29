import { useTheme } from './Theme';
import { classNameFind, separateChildren, setDefault, useStateCombine } from '../utils';
import React, { FunctionComponent, MouseEvent, useRef } from 'react';
import s from './Collapsible.module.scss';

export interface CollapsibleState {
    open: boolean;
}

export interface CollapsibleProps {
    state?: CollapsibleState;
    setState?: React.Dispatch<React.SetStateAction<CollapsibleState>>;

    canCollapse?: boolean;
}

// First child can be function (open)

const Collapsible: FunctionComponent<CollapsibleProps & React.HTMLAttributes<HTMLDivElement>> = ({
    canCollapse: _canCollapse,
    className,
    children,
    state: _state,
    setState: _setState,
    ...props
}) => {
    const theme = useTheme().name;
    className = classNameFind(s, `comp`, theme, className);
    const [state, setState] = useStateCombine({ open: false }, _state, _setState);
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
