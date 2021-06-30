import { Formik } from 'formik';
import React from 'react';
import {
    FaBaby,
    FaBandAid,
    FaBookMedical,
    FaBriefcaseMedical,
    FaCapsules,
    FaHeart,
    FaHeartbeat,
    FaPlusCircle,
    FaPlusSquare,
} from 'react-icons/fa';
import { GiHealthDecrease, GiHealthIncrease, GiHealthNormal } from 'react-icons/gi';
import { ImLab } from 'react-icons/im';
import Banner from '../atoms/Banner';
import Button from '../atoms/Button';
import Collapsible from '../atoms/Collapsible';
import Divider from '../atoms/Divider';
import Drawer, { DrawerToggle } from '../atoms/Drawer';
import Dropdown from '../atoms/Dropdown';
import Field from '../atoms/Form/Field';
import Input from '../atoms/Form/Input';
import Icon from '../atoms/Icon';

export interface DemoProps {
    // sections?:
}

const buttons = (className: string, name: string, Component: any = Button) => {
    let append = (prefix: string) => {
        return className
            .split(' ')
            .map((c) => `${prefix ? prefix + (c ? '-' : '') : ''}${c}`)
            .join(' ');
    };
    return (
        <div>
            {name ? <h3>{name}</h3> : ''}
            <div
            // style={{gap:'20px',display:'flex', justifyContent: 'center'}}
            >
                <Component className={append(`primary`)}>Primary</Component>
                &nbsp;
                <Component className={append(`secondary`)}>Secondary</Component>
                &nbsp;
                <Component className={append(`warn`)}>Warn</Component>
                &nbsp;
                <Component className={append(`primary`)} disabled>
                    Disabled
                </Component>
            </div>
        </div>
    );
};

const allTypes = (Component: any) => {
    return (
        <>
            <Component>Default</Component>
            &nbsp;
            {/* <Divider className="thinner"/> */}
            {buttons(``, `Normal`, Component)}
            {/* <Divider className="thinner"/> */}
            {buttons(`active`, `Active`, Component)}
            {/* <Divider className="thinner"/> */}
            {buttons(`border`, `Border`, Component)}
            {buttons(`active border`, `Active Border`, Component)}
            {/* <Divider className="thinner"/> */}
            {buttons(`background`, `Background`, Component)}
            {/* <Divider className="thinner"/> */}
            {buttons(`background-active`, `Background Active`, Component)}
            {/* <Divider className="thinner"/> */}
            {buttons(`background-active-text`, `Background Active Text`, Component)}
        </>
    );
};

class Demo extends React.Component<DemoProps> {
    render() {
        const FieldFunc = (props: any) => {
            return <Field name='name' label='Name' {...props}></Field>;
        };
        const MyIcon = (props: any) => <Icon style={{ margin: '5px auto 8px' }} icon={props.icon} />;
        return (
            <div style={{ textAlign: 'center', padding: '56px 5%' }}>
                <h1>Atoms</h1>
                <Divider className='thin' />
                <h2>Button</h2>
                {allTypes(Button)}
                <Divider className='thin' />
                <h2>Banner</h2>
                {allTypes(Banner)}
                <Divider className='thin' />
                <h2>Input</h2>
                {allTypes(Input)}
                <Divider className='thin' />
                <h2>Field</h2>
                <Formik initialValues={{ name: 'Hello' }} onSubmit={(values) => console.log(values)}>
                    {allTypes(FieldFunc)}
                </Formik>
                <Divider className='thin' />
                <h2>Divider</h2>
                Thick
                <Divider />
                Thin
                <Divider className='thin' />
                Thinner
                <Divider className='thinner' />
                <h2>Drawer</h2>
                <Drawer>
                    <div className='primary-background'>
                        <DrawerToggle>
                            <Button>Close</Button>
                        </DrawerToggle>
                        Side Menu
                    </div>
                    <DrawerToggle>
                        <Button>Toggle Me</Button>
                    </DrawerToggle>
                </Drawer>
                <h2>Expander</h2>
                <Collapsible>
                    <Button>Toggle Expand</Button>
                    <Button>Example1</Button>
                    <Button>Example2</Button>
                    <Button>Example3</Button>
                </Collapsible>
                <h2>Dropdown</h2>
                <Dropdown>
                    <Button>Menu</Button>
                    <div>Hello there</div>
                </Dropdown>
                <h2>Icons</h2>
                FaBriefcaseMedical
                <MyIcon icon={FaBriefcaseMedical} />
                FaBookMedical
                <MyIcon icon={FaBookMedical} />
                FaBaby
                <MyIcon icon={FaBaby} />
                FaBandAid
                <MyIcon icon={FaBandAid} />
                FaCapsules
                <MyIcon icon={FaCapsules} />
                FaPlusCircle
                <MyIcon icon={FaPlusCircle} />
                FaPlusSquare
                <MyIcon icon={FaPlusSquare} />
                FaHeart
                <MyIcon icon={FaHeart} />
                FaHeartbeat
                <MyIcon icon={FaHeartbeat} />
                GiHealthNormal
                <MyIcon icon={GiHealthNormal} />
                GiHealthIncrease
                <MyIcon icon={GiHealthIncrease} />
                GiHealthDecrease
                <MyIcon icon={GiHealthDecrease} />
                ImLab
                <MyIcon icon={ImLab} />
            </div>
        );
    }
}

export default Demo;
