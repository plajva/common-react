import React, { FunctionComponent, ReactNode, useContext } from 'react';
import s from './Info.module.scss';
import { useTheme } from '@catoms/Theme';
import { classNameFind } from '@common/utils';
import Icon from './Icon';
import { FiHelpCircle } from 'react-icons/fi';
import { IconType } from 'react-icons/lib';

export interface InfoProps {
	icon?: IconType
}

const Info: FunctionComponent<InfoProps & React.HTMLAttributes<HTMLDivElement>> = ({ className, children, icon, ...props }) => {
	const theme = useTheme().name;
	className = classNameFind(s, `comp flex-vcenter`, theme, className);

	return (
		<div className={className} {...props}>
			{icon && <div>
				<Icon icon={icon || FiHelpCircle} size="30px" className="margin-h-4"/>
			</div>}
			<div>
				{children}
			</div>
		</div>
	)
}

export default Info;