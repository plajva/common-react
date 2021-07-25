import { IconType } from "react-icons";
import Button from "../atoms/Button";
import Icon from "../atoms/Icon";
import { ThemeToggle } from "../atoms/Theme";
import {FiSun} from 'react-icons/fi'

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
