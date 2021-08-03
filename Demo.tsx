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
import Banner from './atoms/Banner';
import Button from './atoms/Button';
import Collapsible from './atoms/Collapsible';
import Divider from './atoms/Divider';
import Dropdown from './atoms/Dropdown';
import { Field } from './atoms/Form/Field';
import Form from './atoms/Form/Form';
// import Field from './atoms/Form/Field';
import Input from './atoms/Form/Input';
import Toggle from './atoms/Form/Toggle';
import Icon from './atoms/Icon';
import { useNotifications } from './atoms/Notifications';
import Stepper from './atoms/Stepper';
import { useTheme } from './atoms/Theme';

export interface DemoProps {
    // sections?:
}

const buttons = (className: string, name: string, Component: any = Button, extraClass?: string) => {
    let append = (prefix: string) => {
        return (
            className
                .split(' ')
                .map((c) => `${prefix ? prefix + (c ? '-' : '') : ''}${c}`)
                .join(' ') +
            ' margin-1 ' +
            (extraClass ? ' ' + extraClass : '')
        );
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

const Demo = (props) => {
    const theme = useTheme();
    // const FieldFunc = (props: any) => {
    //     return <Field name='name' label='Name' {...props}></Field>;
    // };
    const table = (v: number) => {
        const rows = v % 2 === 0 ? 10 : 20,
            cols = 10;
        return (
            <tbody>
                {Array.from(Array(rows).keys()).map((r) => (
                    <tr key={r}>
                        {Array.from(Array(cols).keys()).map((c) => (
                            <td key={c} style={{ margin: 3 }}>
                                {r * cols + c}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        );
    };
    const notifications = useNotifications();
    const MyIcon = (props: any) => <Icon style={{ margin: '5px auto 8px' }} icon={props.icon} />;
    return (
        <div style={{ textAlign: 'center', padding: '56px 5%' }}>
            <Stepper
                animTime={0.3}
                steps={Array.from(Array(5).keys()).map((v) => {
                    return {
                        header: `Menu ${v}`,
                        value: (
                            <div>
                                <h3>Test {v}</h3>
                                <table style={{ width: '100%' }}>{table(v)}</table>
                            </div>
                        ),
                    };
                })}
            />
            <h1>Atoms</h1>
            <Divider className='thin' />
            <h2>Form</h2>
            <Form initialState={{ first: '', last: '' }}>
                {(form) => (
                    <div className='col'>
                        <div className='col-6'>
                            <h4>{`<Input>`}</h4>
                            <Input name='first' placeholder='First Name' />
                            First is {form.state.values['first']}
                        </div>
                        <div className='col-6'>
                            <h4>{`<Field>`}</h4>
                            <Field name='last' placeholder='Last Name' />
                            Last is {form.state.values['last']}
                        </div>
                        <div className='col-6'>
                            <Input placeholder='Type Flavor' />
                        </div>
                        <div className='col-6'>
                            <Input placeholder='Type Awesomeness' />
                        </div>
                        <div className='col-6'>
                            <Field checked={theme.name === 'default'} type='toggle' onChange={() => theme.next()}>
                                {theme.name[0].toUpperCase() + theme.name.substring(1)}
                            </Field>
                        </div>
                        <div className='col-6'>
                            <Toggle className='secondary'>Secondary</Toggle>
                        </div>
                    </div>
                )}
            </Form>
            <Divider className='thin' />
            <h2>Notifications</h2>
            <div>
                <Form>
                    {(form) => (
                        <>
                            <Field name='type' type='select' label='Type'>
                                <option value='success'>Success</option>
                                <option value='warning'>Warning</option>
                                <option value='error'>Error</option>
                            </Field>
                            <Field name='sticky' type='checkbox' label='Sticky' />
                            <Field name='icon' type='checkbox' label='Icon' />
                            <Field name='text' />
                            <Button onClick={() => notifications.addNotification(form.state.values)}>
                                Test Notification
                            </Button>
                        </>
                    )}
                </Form>
            </div>
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
            {/* <h2>Field</h2>
                <Formik initialValues={{ name: 'Hello' }} onSubmit={(values) => console.log(values)}>
                    {allTypes(FieldFunc)}
                </Formik> */}
            <Divider className='thin' />
            <h2>Divider</h2>
            Thick
            <Divider />
            Thin
            <Divider className='thin' />
            Thinner
            <Divider className='thinner' />
            <h2>Drawer</h2>
            {/* <Drawer
                    drawer={
                        <div className='primary-background'>
                            <DrawerToggle>
                                <Button>Close</Button>
                            </DrawerToggle>
                            Side Menu
                        </div>
                    }
                >
                    <DrawerToggle>
                        <Button>Toggle Me</Button>
                    </DrawerToggle>
                </Drawer> */}
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
};

export default Demo;
