import React, { Context, createContext, Dispatch, SetStateAction } from 'react';
import { setDefault, useStateCombine } from '../../utils';
/**
 * StateCombineHOC is passed a component that needs a state, but this state is optionally controlled by another component higher up
 * It also optionally provides a context
 */
export interface StateCombineProps<T> {
	state: T;
	setState: Dispatch<SetStateAction<T>>;
}
export const StateCombineContext = <State extends {}>(initialState:State)=>createContext<StateCombineProps<State>>({state:initialState, setState:()=>{}});
interface StateCombineOptions<T> {
	initialState: T;
	context?: Context<StateCombineProps<T>>;
}
const StateCombineHOC = <EProps extends {}, State>(
	Comp: (props: EProps & StateCombineProps<State>) => any,
	options: StateCombineOptions<State>
) => {
	// HOC Component creator execution
	const StateCombine = ({
			initialState,
			state: _state,
			setState: _setState,
			...props
	}: Partial<EProps> & Partial<StateCombineProps<State>> & { initialState?: State }) => {
			const [state, setState] = useStateCombine(setDefault(initialState, options.initialState), _state, _setState);
			const comp = <Comp {...(props as EProps)} state={state} setState={setState} />;
			return options.context ? (
					<options.context.Provider value={{ state, setState }}>{comp}</options.context.Provider>
			) : (
					comp
			);
	};

	return StateCombine;
};
export default StateCombineHOC;
// ----------------------------------------------