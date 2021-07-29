import { useTheme } from './Theme';
import { classNameFind } from '../utils';
import React, { FunctionComponent } from 'react';
import s from './Button.module.scss';
import Ripple from './HOC/Ripple';

export interface ButtonCompProps {
    button_type?: 'normal' | 'icon';
    button_size?: string | number;
}
export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & ButtonCompProps;
// We need to set the className and provide aditinal classnames on component call

const Button: FunctionComponent<ButtonProps> = ({ button_type, button_size, ...props }) => {
    const theme = useTheme().name;
    let { className, ...others } = props;
    className = classNameFind(s, `button`, button_type === 'icon' ? 'circular icon' : '', 'dup', theme, className);

    return (
        <button
            className={className}
            style={{
                width: button_size ? button_size : undefined,
                height: button_size ? button_size : undefined,
                ...props.style,
            }}
            {...others}
        >
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
