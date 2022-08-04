import React, { FunctionComponent } from 'react';
import { classNameFind } from '../utils';
import s from './Button.module.scss';
import Ripple from './HOC/Ripple';
import Icon from './Icon';
import { useTheme } from './Theme';

export interface ButtonCompProps {
	button_type?: 'normal' | 'icon';
	button_size?: string | number;
	// * Helper prop, includes an icon in content and sets defaults
	icon?: any;
}
export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & ButtonCompProps;
// We need to set the className and provide aditinal classnames on component call

const Button: FunctionComponent<ButtonProps> = ({ button_type, button_size, icon, ...props }) => {
	const theme = useTheme().name;
	let { className, ...others } = props;
	// Set default button type as icon if icon prop is passed
	if (icon) button_type = button_type ?? 'icon';

	className = classNameFind(
		s,

		button_type === 'icon' ? 'circular icon' : '',
		'padding-3 border-radius-2',
		'dup',
		theme,
		`button`,
		className
	);

	return (
		<button
			type='button'
			className={className}
			style={{
				width: button_size ? button_size : undefined,
				height: button_size ? button_size : undefined,
				...props.style,
			}}
			{...others}
		>
			{icon && <Icon icon={icon} />}
			{props.children}
		</button>
	);
};

// class Button extends React.Component<ButtonProps & AtomProps>{
// 	render(){
// 		let {className, ...others} = this.props;
// 		// Try to find the classes in our css classes
// 		return (
// 			<button className={classNameFind(s, `button`, className)} {...others}>
// 				{this.props.children}
// 			</button>
// 		)
// 	}
// }
// const ButtonRipple = <Ripple><Button></Button></Ripple>;

const RButton = Ripple(Button);
export default RButton;
