import { useTheme } from './Theme';
import { classNameFind,  } from '../utils';
import React, { FunctionComponent, ReactNode, useEffect, useRef, useState } from 'react';
import { useStateCombine } from '../utils_react';
import Button from './Button';
import Divider from './Divider';
import s from './Stepper.module.scss';

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
    step?: number | string;
    setStep?: any;
    showSteps?: boolean;
    steps: { header?: string; value: ReactNode }[];
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
    const stepToNumber = (step?: number | string) => {
        return typeof step === 'string' ? props.steps.findIndex((s) => s.header === step) : step;
    };

    let { className, step: _step, setStep: _setStep, steps, showSteps: _showSteps, animTime, ...others } = props;
    // This is the wanted step
    const [stepWanted, setStepWanted] = useStateCombine(0, stepToNumber(_step), _setStep);
    // This is the step cache, doesn't change until animation is done
    const [stepLast, setStepLast] = useState<number>(stepToNumber(_step) || 0);

    const scrollerRef = useRef<HTMLDivElement>(null);
    const section = useRef<HTMLElement | null>(null);
    const lastHeight = useRef<number | undefined>(undefined);

    const theme = useTheme().name;
    const showSteps = (_showSteps ??  true);
    className = classNameFind(s, `atom`, 'dup', theme, className);
    const scrollerClass = classNameFind(s, `scroller`, 'dup');
    animTime = (animTime ??  1);

    // Effects run after Render of the component
    // If nextStep != step, mount nextStep
    useEffect(() => {
        // The timeout to remove from DOM
        if (stepWanted === stepLast) return; // Prevent calling timeout

        let tid = 0;
        if (animTime) {
            tid = setTimeout(() => {
                setStepLast(stepWanted);
            }, (animTime || 1) * 1000) as any as number;
        } else setStepLast(stepWanted);

        const handleResize = () => {
            // console.log(`Handled resize ${section?.current}`)
            if (stepLast === stepWanted) {
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
    }, [animTime, stepWanted, stepLast]);

    // Sets scroller height
    const setHeight = (height: number) => {
        if (scrollerRef.current) {
            if (height) {
                scrollerRef.current.style.height = `${height}px`;
                lastHeight.current = height;
            } else scrollerRef.current.style.height = '';
        }
    };

    const nextRefCallback = (ref: HTMLElement) => {
        // console.log(`Ref called: ${ref?.offsetHeight}`);
        if (ref) {
            section.current = ref;
        }
    };

    // console.log(props.children);
    // let children =
    //     // React.Children.toArray(props.children)
    //     props.steps;
    let render_array = steps.reduce<ReactNode[]>((arr, step, i) => {
        let child = step.value;
        let right = stepWanted > stepLast;
        let dirAndTiming = right ? 'normal ease-out' : 'reverse ease-in';
        let done = stepLast === stepWanted;
        let out_anim = done ? '' : `${s.out} ${animTime}s ${dirAndTiming} forwards`,
            in_anim = done ? '' : `${s.in} ${animTime}s ${dirAndTiming} forwards `;

        if (i === stepWanted || i === stepLast) {
            if (React.isValidElement(child)) {
                if (stepWanted === stepLast) {
                    arr.push(
                        React.cloneElement(child, {
                            ref: nextRefCallback,
                            style: { ...child.props.style, position: 'relative' },
                            key: i,
                        })
                    );
                    return arr;
                }
                if (i === stepWanted)
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
        return arr;
    }, []);

    const stepsShow = steps.reduce<ReactNode[]>((arr, child, i) => {
        arr.push(child.header || i + 1);
        return arr;
    }, []);

    // Updating to last height when transitioning, so there's no jump in scrolling
    if (stepLast !== stepWanted) {
        if (lastHeight.current) setHeight(lastHeight.current);
    } else {
        setHeight(0);
    }

    return (
        <div className={className} {...others}>
            <table></table>
            {(showSteps && (
                <div className={classNameFind(s, `stepper`)}>
                    {stepsShow.reduce<ReactNode[]>((a, stepNode, i) => {
                        a.push(
                            <div className={classNameFind(s, `item`)} key={i}>
                                <Button
                                    ripple_type='center'
                                    className={`circular ${stepWanted === i && 'primary-background'}`}
                                    onClick={() => {
                                        if (setStepWanted) setStepWanted(i);
                                    }}
                                >
                                    {stepNode}
                                </Button>
                            </div>
                        );
                        if (i < steps.length - 1)
                            a.push(<Divider className={classNameFind(s, `thinner item divider grow`)} key={-i - 1} />);
                        return a;
                    }, [])}
                </div>
            )) ||
                ''}
            <div ref={scrollerRef} style={{ transition: `height ${animTime}s` }} className={scrollerClass}>
                {render_array}
            </div>
        </div>
    );
};

export default Stepper;
