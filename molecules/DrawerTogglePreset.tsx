import { IconType } from "react-icons";
import Button from "../atoms/Button";
import Icon from "../atoms/Icon";
import { DrawerToggle } from "../atoms/Drawer";
import { BsJustify } from "react-icons/bs";

const DrawerTogglePreset =(props: { icon?: IconType }) => {
	return (
		<DrawerToggle>
			<Button button_type='icon'>
				<Icon icon={props.icon || BsJustify} />
			</Button>
		</DrawerToggle>
	);
};

export default DrawerTogglePreset;