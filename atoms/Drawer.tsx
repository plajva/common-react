import React, {
	CSSProperties,
	MouseEvent,
	ReactElement,
	ReactNode,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react';
import { classNameFind, combineEvent, useStateCombine } from '../utils';
import s from './Drawer.module.scss';
import { useTheme } from './Theme';

type T = { test: number } & ({ j: string } | boolean)

export interface DrawerContentData<T = {}> {
	[key: string]: ({ header?: ReactNode; content?: ReactNode } & T) | false;
}
export interface DrawerContextItems {
	open?: boolean;
	setOpen?: any;
	// ! Depracated
	setContent?: (o: DrawerContentData) => void;
}

export interface DrawerProps extends DrawerContextItems {
	// Animation time in seconds
	animTime?: number;
	widthOpen?: number;
	widthClosed?: number;
	drawer: ReactNode;
	fixed?: boolean;
	floating?: boolean;
	sticky?: boolean;
	visible_always?: boolean;
	right?: boolean;
	background?: boolean;
	contentProps?: React.HTMLAttributes<HTMLDivElement>;
	drawerProps?: React.HTMLAttributes<HTMLDivElement>;
}
export const DrawerContext = React.createContext<DrawerContextItems>({ open: false });

export const DrawerToggleFunc = (drawerContext: DrawerContextItems) => {
	return (e: MouseEvent<HTMLElement>) => {
		if (drawerContext?.setOpen) drawerContext.setOpen(!drawerContext.open);
	};
};

export const useDrawer = () => {
	return useContext(DrawerContext);
};

export interface DrawerToggleProps {
	// Type ReactElement allows type checking to only have 1 valid element inside tags
	children: ReactElement;
}

export const DrawerToggle = ({ children }: DrawerToggleProps) => {
	const drawer = useDrawer();
	// We do this bc children will be an array always
	const child = Array.isArray(children) ? children[0] : children;
	return React.isValidElement<any>(child) ? (
		React.cloneElement(child, { onClick: combineEvent(DrawerToggleFunc(drawer), child.props?.onClick) })
	) : (
		<span style={{ color: 'red' }}>Drawer Toggle child not element?</span>
	);
};
/**
 *
 * @param right: Drawer is on the right
 * @returns
 */
const Drawer: (props: DrawerProps & React.HTMLAttributes<HTMLDivElement>) => ReactElement = ({
	right,
	className,
	children,
	drawer,
	open: _open,
	setOpen: _setOpen,
	animTime: _animTime,
	visible_always,
	floating,
	fixed,
	sticky,
	background,
	widthOpen,
	widthClosed,
	contentProps,
	drawerProps,
	...props
}) => {
	// True if opening/open, False if closing/closed
	const [open, setOpen] = useStateCombine<boolean>(false, _open, _setOpen);
	background = background ?? visible_always ? false : true;

	// True when open, False if closed
	// const [isOpen, setIsOpen] = useState(false);
	// const isOpenTimer = useRef(0);

	const animTime = _animTime ?? 0.4;

	background = background ?? true;
	const back = useRef<HTMLDivElement>(null);
	const menu = useRef<HTMLDivElement>(null);
	const theme = useTheme().name;
	className = classNameFind(s, `comp`, theme, className);

	// ! Depracated
	const [_contentData, _setContentData] = useState<DrawerContentData>({});
	const getContentData = () => _contentData;
	const setContentData = (v) => _setContentData(v);
	useEffect(() => {
		// Clear right after rendering on every child change
		if (Object.entries(getContentData()).length) {
			setContentData({});
			// console.log('Cleared drawer');
		}
		return () => { };
	}, [children]);
	const setContent = (o: DrawerContentData) => {
		const cdk = Object.keys(getContentData());
		if (!Object.keys(o).every((k) => cdk.includes(k))) setContentData({ ...getContentData(), ...o });
	};
	// ! -------

	const menuBack_class = fixed ? 'fixed' : sticky ? 'sticky' : '';
	const mb_styles = {
		transition: `${animTime}s, opacity cubic-bezier(.01,.79,.57,1) ${animTime}s`,
	};
	const menu_style: CSSProperties = visible_always
		? open
			? { maxWidth: widthOpen ?? 240 }
			: { maxWidth: widthClosed ?? 60 }
		: open
			? {
				transform: `translate(${!right ? '0' : '0'},${floating ? '-50%' : '0'})`,
				opacity: 1,
			}
			: {
				transform: `translate(${!right ? '-100%' : '100%'},${floating ? '-50%' : '0'})`,
				opacity: 0,
			};
	const content_styles: CSSProperties = visible_always
		?
		{ marginLeft: (open ? (widthOpen ?? 240) : widthClosed ?? 60) - 24 }
		: {};

	return (
		<DrawerContext.Provider value={{ open, setOpen, setContent }}>
			{/* <div className={classNameFind(s, "parent")}> */}
			<div className={className} {...props}>
				{
					// (isOpen || open) &&
					<>
						{/* The shaded back panel, if clicked will close the drawer */}
						{background && (
							<div
								className={classNameFind(s, `back`, menuBack_class)}
								style={{
									opacity: open ? 1 : 0,
									pointerEvents: !open ? 'none' : undefined,
									...mb_styles,
								}}
								ref={back}
								onClick={() => {
									setOpen(false);
								}}
							></div>
						)}
						{/* The drawer */}
						<div
							{...drawerProps}
							className={classNameFind(
								s,
								'menu',
								`${right ? 'menu-right' : 'menu-left'}`,
								floating ? 'floating' : '',
								menuBack_class,
								drawerProps?.className,
								visible_always ? 'v_always' : ''
							)}
							ref={menu}
							style={{
								...menu_style,
								...mb_styles,
								...drawerProps?.style,
							}}
						>
							{drawer}
							{Object.entries(getContentData()).map(
								([k, v], i) =>
									v && (
										<div>
											<div className={classNameFind(s, 'hook-header', 'margin-2 margin-top-4')}>{v.header}</div>
											<div>{v.content}</div>
										</div>
									)
							)}
						</div>
					</>
				}
				<div
					{...contentProps}
					className={classNameFind(s, `content`, contentProps?.className)}
					style={{ ...content_styles, ...mb_styles, ...(contentProps?.style || {}) }}
				>
					{children}
				</div>
			</div>
			{/* </div> */}
		</DrawerContext.Provider>
	);
};

export default Drawer;
