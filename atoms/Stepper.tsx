import React, { FunctionComponent, ReactNode, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import s from './Stepper.module.scss';
import { useTheme } from '@catoms/Theme';
import { classNameFind } from '@common/utils';
import { render } from '@testing-library/react';
import Button from './Button';
import Divider from './Divider';

/**
 * The stepper works by switching between two modes
 * 	1.Absolute positioning when transitioning between sections
 * 	2.Relative/static positioning when done with transition
 *
 * A normal cycle for transitioning would be:
 * 	1.(1st frame)Switch to Absolute, set current height, mount next component.
 * 	2.(2nd frame)Set next height, wait for animation
 * 	3.(After transition)Switch to Relative, unset height
 */

export interface StepperProps {
    step?: number;
    stepSet?: any;
    /** Animaiton time, in seconds */
    animTime?: number;
}

/**
 * Children are the tabs/steps, they should be containers for you content, ex: div
 * Does animation on tab change, adds/removes from DOM on step change
 * Updates on step_chage, animation_done
 *
 * @param props
 */
const Stepper: FunctionComponent<StepperProps & React.HTMLAttributes<HTMLDivElement>> = (props) => {
    const [step, setStep] = useState(props.step ? props.step : 0);
    // const [height, setHeight] = useState(0);
    const scrollerRef = useRef<HTMLDivElement>(null);
    const section = useRef<HTMLElement | null>(null);
    const lastHeight = useRef<number | undefined>(undefined);
    const theme = useTheme().name;
    let { className, step: propStep, stepSet, animTime, ...others } = props;
    className = classNameFind(s, `atom`, 'dup', theme, className);
    const scrollerClass = classNameFind(s, `scroller`, 'dup');
    const nextStep = propStep ? propStep : 0;
    animTime = animTime || animTime === 0 ? animTime : 1;

    // Effects run after Render of the component
    // If nextStep != step, mount nextStep
    useEffect(() => {
        // The timeout to remove from DOM
        if (nextStep === step) return; // Prevent calling timeout

        let tid = 0;
        if (animTime) {
            tid = (setTimeout(() => {
                setStep(nextStep);
            }, (animTime || 1) * 1000) as any) as number;
        } else setStep(nextStep);

        const handleResize = () => {
            // console.log(`Handled resize ${section?.current}`)
            if (step === nextStep) {
                setHeight(0);
            } else if (section.current) {
                setHeight(section.current.scrollHeight);
            }
        };
        // if(section.current)setHeight(section.current.offsetHeight);
        window.addEventListener('resize', handleResize);
        // if(lastHeight.current)setHeight(lastHeight.current)

        handleResize();

        return () => {
            if (tid) clearTimeout(tid);
            window.removeEventListener('resize', handleResize);
        };
    }, [animTime, nextStep, step]);

    // Sets scroller height
    const setHeight = (height: number) => {
        if (scrollerRef.current) {
            if (height) {
                scrollerRef.current.style.height = `${height}px`;
                lastHeight.current = height;
            } else scrollerRef.current.style.height = '';
        }
    };

    // useLayoutEffect(() => {
    // 	return () => {
    // 	};
    // })

    const nextRefCallback = (ref: HTMLElement) => {
        // console.log(`Ref called: ${ref?.offsetHeight}`);
        if (ref) {
            section.current = ref;
        }
    };

    // console.log(props.children);
    let children = React.Children.toArray(props.children);
    let render_array = children.reduce<ReactNode[]>((arr, child, i) => {
        let right = nextStep > step;
        let dirAndTiming = right ? 'normal ease-out' : 'reverse ease-in';
        let done = step === nextStep;
        let out_anim = done ? '' : `${s.out} ${animTime}s ${dirAndTiming} forwards`,
            in_anim = done ? '' : `${s.in} ${animTime}s ${dirAndTiming} forwards `;
        if (i === nextStep || i === step) {
            if (React.isValidElement(child)) {
                if (nextStep === step) {
                    arr.push(
                        React.cloneElement(child, {
                            ref: nextRefCallback,
                            style: { ...child.props.style, position: 'relative' },
                            key: i,
                        })
                    );
                    return arr;
                }
                if (i === nextStep)
                    arr.push(
                        React.cloneElement(child, {
                            style: {
                                ...child.props.style,
                                animation: right ? in_anim : out_anim,
                                transform: 'translateZ(0)',
                            },
                            ref: nextRefCallback,
                            key: i,
                        })
                    );
                else {
                    arr.push(
                        React.cloneElement(child, {
                            style: {
                                ...child.props.style,
                                animation: right ? out_anim : in_anim,
                                transform: 'translateZ(0)',
                            },
                            key: i,
                        })
                    );
                }
            }
        }
        // else{
        // 	if (React.isValidElement(child))arr.push(React.cloneElement(child, { style: {display:'none'}}))
        // }
        return arr;
    }, []);

    const steps = children.reduce<ReactNode[]>((arr, child, i) => {
        arr.push((React.isValidElement(child) && child.props.step) || i + 1);
        return arr;
    }, []);

    // if ( !child){
    // 	arr.push(<>
    // 		Step {step}<br />
    // 		<Button onClick={() => { setStep(step - 1)}}>Previous</Button>
    // 		<Button onClick={() => { setStep(step + 1)}}>Next</Button>
    // 	</>)
    // }

    // Updating to last height when transitioning, so there's no jump in scrolling
    if (step != nextStep) {
        if (lastHeight.current) setHeight(lastHeight.current);
    } else {
        setHeight(0);
    }

    return (
        <div className={className} {...others}>
            <table></table>
            <div className={classNameFind(s, `stepper`)}>
                {steps.map((stepNode, i) => (
                    <>
                        <div className={classNameFind(s, `item`)} key={i}>
                            <Button
                                ripple_type='center'
                                className={`circular ${propStep === i && 'primary-background'}`}
                                onClick={() => {
                                    if (stepSet) stepSet(i);
                                }}
                            >
                                {stepNode}
                            </Button>
                        </div>
                        {i !== steps.length - 1 && (
                            <Divider className={classNameFind(s, `thinner item divider grow`)} key={i + 100} />
                        )}
                    </>
                ))}
            </div>
            <div ref={scrollerRef} style={{ transition: `height ${animTime}s` }} className={scrollerClass}>
                {render_array}
            </div>
        </div>
    );
};

export default Stepper;
