import { IconType } from 'react-icons';
import { FiSun } from 'react-icons/fi';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import { ThemeToggle } from '../atoms/Theme';

const ThemeTogglePreset = (props: { icon?: IconType }) => {
	return (
		<ThemeToggle>
			<Button button_type='icon'>
				<Icon icon={props.icon || FiSun} />
			</Button>
		</ThemeToggle>
	);
};

export default ThemeTogglePreset;
