import React, { ReactNode } from "react";
import s from './Table.module.scss';
import { useTheme } from "@common/atoms/Theme";
import { cnf } from "@common/utils";

export interface TableProps{
	children?: ReactNode;
}

const Table = ({
	className,
	children,
	...props
}: TableProps & React.HTMLAttributes<HTMLDivElement>) => {
	const theme = useTheme().name;
	className = cnf(s, `comp`, theme, className);

	return (
		<div className={className} {...props}>
			{children}
		</div>
	);
};

export default Table;