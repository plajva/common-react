import React, {
    FunctionComponent,
    ReactNode,
    MouseEvent,
    useContext,
    useRef,
    useState,
    useEffect,
    useLayoutEffect,
} from 'react';
import s from './Drawer.module.scss';
import { useTheme } from '@catoms/Theme';
import { classNameFind, combineState } from '@common/utils';
import Collapsible from './Collapsible';

export interface DrawerContentData {
    [key: string]: { header?: ReactNode; content?: ReactNode };
}
export interface DrawerContextItems {
    open?: boolean;
    setOpen?: any;
    setContent?: any;
}

export interface DrawerProps extends DrawerContextItems {
    animTime?: number;
    maxWidth?: any;
    fixed?: boolean;
    right?: boolean;
}
export const DrawerContext = React.createContext<DrawerContextItems>({ open: false });



export const DrawerToggleFunc = (drawerContext: DrawerProps) => {
    return (e: MouseEvent<HTMLElement>) => {
        if (drawerContext?.setOpen) drawerContext.setOpen(!drawerContext.open);
    };
};

export interface DrawerToggleProps {}

export const DrawerToggle: FunctionComponent<DrawerToggleProps & React.HTMLAttributes<HTMLDivElement>> = ({
    className,
    children,
    ...props
}) => {
    const theme = useTheme().name;
    className = classNameFind(s, `comp`, theme, className);

    const drawer = useContext(DrawerContext);

    return (
        <div className={className} onClick={DrawerToggleFunc(drawer)} {...props}>
            {children}
        </div>
    );
};

/**
 * |--Drawer---|-----------|
 * |1st Child  |all others |
 * |-----------|-----------|
 * @param param0
 */
const Drawer: FunctionComponent<DrawerProps & React.HTMLAttributes<HTMLDivElement>> = ({
    right,
    className,
    children,
    open: _open,
    setOpen: _setOpen,
    animTime: _animTime,
    fixed,
    maxWidth,
    ...props
}) => {
    // True if opening/open, False if closing/closed
    const [open, setOpen] = combineState(useState(_open ? _open : false), _open, _setOpen);
    // True when open, False if closed
    const [is_open, setIsOpen] = useState(false);
    const is_open_timer = useRef(0);

    const animTime = typeof _animTime !== 'undefined' ? _animTime : 1;
    // const [open, setOpen] = useState(_open ? _open : false);
    const back = useRef<HTMLDivElement>(null);
    const menu = useRef<HTMLDivElement>(null);
    const hookContent = useRef<HTMLDivElement>(null);
    const hookContentData = useRef<DrawerContentData>({});

	const theme = useTheme().name;
	className = classNameFind(s, `comp`, theme, className);

    // Defines what will get drawn
    const _children = React.Children.toArray(children);
    let child_first: ReactNode;
    if (_children.length) {
        child_first = _children.splice(0, 1);
    }
    const child_rest = _children;

    const setContent = (o: DrawerContentData) => {
        // if(Object.entries(o).some(([k,v]) => typeof v !== typeof hookContentData[k]))
        // 	setHookContentData(o)
        hookContentData.current = { ...hookContentData.current, ...o };
    };

    useEffect(() => {
        if (back.current) {
            if (open) {
                back.current.style.opacity = '1';
            } else {
                back.current.style.opacity = '0';
            }
        }
        if (menu.current) {
            if (open) {
                menu.current.style.animation = `${
                    right ? s.right_in : s.left_in
                } ${animTime}s normal ease-out forwards`;
            } else {
                menu.current.style.animation = `${
                    right ? s.right_out : s.left_out
                } ${animTime}s normal ease-out forwards`;
            }
        }

        // Timeout for opening animation
        if ((is_open && !open) || (!is_open && open)) {
            is_open_timer.current = (setTimeout(() => {
                setIsOpen(open);
                clearTimeout(is_open_timer.current);
                is_open_timer.current = 0;
            }, animTime * 1000) as any) as number;
        }
        return () => {
            hookContentData.current = {};

            clearTimeout(is_open_timer.current);
            is_open_timer.current = 0;
        };
    });
    // useLayoutEffect(() => {hookContentData.current = {};})

    return (
        <DrawerContext.Provider value={{ open: open, setOpen: setOpen, setContent: setContent }}>
            <div className={className} {...props}>
                {(is_open || open) && (
                    <>
                        {/* The shaded back panel, if clicked will close the drawer */}
                        <div
                            className={classNameFind(s, `back`, fixed ? 'fixed' : '')}
                            style={{ opacity: '0', transition: `opacity ${animTime}s` }}
                            ref={back}
                            onClick={() => {
                                setOpen(false);
                            }}
                        ></div>
                        {/* The drawer */}
                        <div
                            className={classNameFind(
                                s,
                                `menu ${right ? 'menu-right' : 'menu-left'}`,
                                fixed ? 'fixed' : ''
                            )}
                            ref={menu}
                            style={{ maxWidth: maxWidth }}
                        >
                            {child_first}
                            {hookContentData &&
                                Object.entries(hookContentData.current).map(([k, v], i) => v && <div></div>)}
                        </div>
                    </>
                )}
                <div className={classNameFind(s, `content`)}>{child_rest}</div>
            </div>
        </DrawerContext.Provider>
    );
};

export default Drawer;
