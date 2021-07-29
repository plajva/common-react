import { IconType } from "react-icons";
import Button, { ButtonProps } from "../atoms/Button";
import Icon from "../atoms/Icon";
import { DrawerToggle } from "../atoms/Drawer";
import { BsJustify } from "react-icons/bs";

const DrawerTogglePreset =({icon,...props}: ButtonProps & { icon?: IconType }) => {
	return (
		<DrawerToggle>
			<Button button_type='icon' {...props}>
				<Icon icon={icon || BsJustify} />
			</Button>
		</DrawerToggle>
	);
};

export default DrawerTogglePreset;