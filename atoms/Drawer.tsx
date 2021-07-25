import { useTheme } from "@catoms/Theme";
import { classNameFind, combineEvent, setDefault, useStateCombine } from "@common/utils";
import React, {
	FunctionComponent,
	MouseEvent,
	ReactElement,
	ReactNode,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";

import s from "./Drawer.module.scss";

export interface DrawerContentData {
	[key: string]: { header?: ReactNode; content?: ReactNode };
}
export interface DrawerContextItems {
	open?: boolean;
	setOpen?: any;
	setContent?: any;
}

export interface DrawerProps extends DrawerContextItems {
	// Animation time in seconds
	animTime?: number;
	maxWidth?: any;
	drawer: ReactNode;
	fixed?: boolean;
	sticky?: boolean;
	right?: boolean;
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
		<span style={{ color: "red" }}>Drawer Toggle child not element?</span>
	);
};

const Drawer: (props: DrawerProps & React.HTMLAttributes<HTMLDivElement>) => ReactElement = ({
	right,
	className,
	children,
	drawer,
	open: _open,
	setOpen: _setOpen,
	animTime: _animTime,
	fixed,
	sticky,
	maxWidth,
	...props
}) => {
	// True if opening/open, False if closing/closed
	const [open, setOpen] = useStateCombine(false, _open, _setOpen);
	// True when open, False if closed
	const [isOpen, setIsOpen] = useState(false);
	const isOpenTimer = useRef(0);

	const animTime = setDefault(_animTime, 0.4);

	const back = useRef<HTMLDivElement>(null);
	const menu = useRef<HTMLDivElement>(null);
	const hookContentData = useRef<DrawerContentData>({});

	const theme = useTheme().name;
	className = classNameFind(s, `comp`, theme, className);

	const setContent = (o: DrawerContentData) => {
		hookContentData.current = { ...hookContentData.current, ...o };
	};

	// useEffect(() => {
	// 	const onEvent = (event: "open" | "closed" | "opening" | "closing") => {
	// 		// console.log(event)
	// 		switch (event) {
	// 			case "open":
	// 				// if (back.current) back.current.style.opacity = "1";
	// 				// if (menu.current){
	// 				// 	menu.current.style.animation = `${right ? s.right : s.left} ${animTime}s normal ease-out forwards`;

	// 				// }

	// 				break;
	// 			case "closed":
	// 				// if (back.current) back.current.style.opacity = "0";
	// 				// if (menu.current) {
	// 				// 	menu.current.style.animation = `${right ? s.right : s.left} ${animTime}s reverse ease-out forwards`;
	// 				// 	// menu.current.style.opacity = "0";
	// 				// }
	// 				break;
	// 			case "opening":
	// 				// if (menu.current) menu.current.style.opacity = "1";
	// 				break;
	// 			case "closing":
	// 				break;
	// 		}
	// 	};

	// 	if (isOpen && open) onEvent("open");
	// 	if (!isOpen && !open) onEvent("closed");
	// 	if ((isOpen && !open) || (!isOpen && open)) {
	// 		if (open) {
	// 			onEvent("opening");
	// 		} else {
	// 			onEvent("closing");
	// 		}
	// 		isOpenTimer.current = setTimeout(() => {
	// 			setIsOpen(open);
	// 			clearTimeout(isOpenTimer.current);
	// 			isOpenTimer.current = 0;
	// 		}, animTime * 1000) as any as number;
	// 	}
	// 	return () => {
	// 		clearTimeout(isOpenTimer.current);
	// 		isOpenTimer.current = 0;
	// 	};
	// });

	const mb_className = fixed
		? "fixed"
		// sticky ? "sticky" :
		: "";
	const mb_styles = {
		transition: `${animTime}s, opacity cubic-bezier(.01,.79,.57,1) ${animTime}s`,
	};

	return (
		<DrawerContext.Provider value={{ open: open, setOpen: setOpen, setContent: setContent }}>
			{/* <div className={classNameFind(s, "parent")}> */}
			<div className={className} {...props}>
				{
					// (isOpen || open) &&
					<>
						{/* The shaded back panel, if clicked will close the drawer */}
						<div
							className={classNameFind(s, `back`, mb_className)}
							style={{
								opacity: open ? 1 : 0,
								// transition: `opacity ${animTime}s`,
								pointerEvents: !open ? "none" : undefined,
								...mb_styles,
							}}
							ref={back}
							onClick={() => {
								setOpen(false);
							}}
						></div>
						{/* The drawer */}
						<div
							className={classNameFind(
								s,
								"menu",
								// `${right ? "menu-right" : "menu-left"}`,
								mb_className
							)}
							ref={menu}
							style={{
								maxWidth: maxWidth,
								...(open
									? {
											transform: `translateX(${!right ? "0" : "100%"})`,
											opacity: 1,
									  }
									: {
											transform: `translateX(${!right ? "-100%" : "0"})`,
											opacity: 0,
									  }),
								...mb_styles,
							}}
						>
							{drawer}
							{hookContentData &&
								Object.entries(hookContentData.current).map(
									([k, v], i) =>
										v && (
											<div>
												<div className={classNameFind(s, "hook-header", "margin-2 margin-top-4")}>{v.header}</div>
												<div>{v.content}</div>
											</div>
										)
								)}
						</div>
					</>
				}
				<div className={classNameFind(s, `content`)}>{children}</div>
			</div>
			{/* </div> */}
		</DrawerContext.Provider>
	);
};

export default Drawer;
