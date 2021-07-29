import { IconType } from 'react-icons';
import { BsJustify } from 'react-icons/bs';
import Button, { ButtonProps } from '../atoms/Button';
import { DrawerToggle } from '../atoms/Drawer';
import Icon from '../atoms/Icon';

const DrawerTogglePreset = ({ icon, ...props }: ButtonProps & { icon?: IconType }) => {
    return (
        <DrawerToggle>
            <Button button_type='icon' {...props}>
                <Icon icon={icon || BsJustify} />
            </Button>
        </DrawerToggle>
    );
};

export default DrawerTogglePreset;
