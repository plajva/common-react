import React, { FunctionComponent } from 'react';
import { IconType } from 'react-icons/lib';
import { classNameFind } from '../utils';
import Icon from './Icon';
import s from './Info.module.scss';
import { useTheme } from './Theme';

export interface InfoProps {
	icon?: IconType;
	type?: 'error' | '';
}

const Info: FunctionComponent<InfoProps & React.HTMLAttributes<HTMLDivElement>> = ({
	className,
	children,
	icon,
	type,
	...props
}) => {
	const theme = useTheme().name;
	className = classNameFind(s, `comp flex-vcenter`, type, theme, className);

	return (
		<div className={className} {...props}>
			{icon && (
				<div>
					<Icon icon={icon} size='30px' className='margin-h-4' />
				</div>
			)}
			<div>{children}</div>
		</div>
	);
};

export default Info;
