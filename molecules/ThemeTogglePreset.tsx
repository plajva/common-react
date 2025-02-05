import { IconType } from 'react-icons';
import { FiSun } from 'react-icons/fi';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import { ThemeToggle } from '../atoms/Theme';

const ThemeTogglePreset = (props: { icon?: IconType , buttonProps?}) => {
	return (
		<ThemeToggle>
			<Button {...props.buttonProps}>
				<Icon icon={props.icon || FiSun} /> Toggle Theme
			</Button>
		</ThemeToggle>
	);
};

export default ThemeTogglePreset;
