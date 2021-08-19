import React, { Context, createContext, Dispatch, SetStateAction } from 'react';
import { useStateCombine } from '../../utils';
/**
 * StateCombineHOC is passed a component that needs a state, but this state is optionally controlled by another component higher up
 * It also optionally provides a context
 */
export interface StateCombineProps<T> {
    state: T;
    setState: Dispatch<SetStateAction<T>>;
    initialState: T;
}
export const StateCombineContext = <State extends {}, P = {}>(initial: StateCombineProps<State> & P) =>
    createContext(initial);
interface StateCombineOptions<T, P> {
    initialState: T;
    /** If your context is handled by StateCombine you NEED to pass a contextExtra  */
    context?: Context<StateCombineProps<T> & P>;
    /** Defines extra values for context */
    contextExtra?: P;
}
const StateCombineHOC = <EProps extends {}, State, P = {}>(
    Comp: (props: EProps & StateCombineProps<State>) => any,
    _options:
        | StateCombineOptions<State, P>
        | ((p: Partial<EProps> & Partial<StateCombineProps<State>>) => StateCombineOptions<State, P>)
) => {
    // HOC Component creator execution
    const StateCombine = (_props: Partial<EProps> & Partial<StateCombineProps<State>>) => {
        // Define options by calling the function if necessary
        const options = typeof _options === 'function' ? _options(_props) : _options;
        
        // Spread out State Combine Component Props
        const { initialState, state: _state, setState: _setState, ...props } = _props;
        
        // Give priority to the function option that set the inital state, because we are dynamically creating it.
        const initial =
            typeof _options === 'function' ? options.initialState : (initialState ??  options.initialState);
        
        // Create state
        const [state, setState] = useStateCombine(initial, _state, _setState);
        
        // Define new component with redefined props
        const comp = <Comp {...(props as EProps)} state={state} setState={setState} initialState={initial} />;
        
        // Return either the component inside a context, or the component itself if the context invalid
        return options.context && options.contextExtra ? (
            <options.context.Provider value={{ state, setState, ...options.contextExtra, initialState: initial }}>
                {comp}
            </options.context.Provider>
        ) : (
            comp
        );
    };

    return StateCombine;
};
export default StateCombineHOC;
// ----------------------------------------------
