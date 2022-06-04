import { clone, cloneDeep, merge } from 'lodash';
import React, { Context, createContext, Dispatch, SetStateAction, useMemo, useState } from 'react';
import { deepMerge, RecursivePartial } from '../../utils';
/**
 * StateCombineHOC is passed a component that needs a state, but this state is optionally controlled by another component higher up
 * It also optionally provides a context that includes this state,setState
 *
 * This is a much more involved way of using useStateCombine
 *
 * ------------------ EXAMPLE FOR COLLAPSIBLE ----------------
 *
 *
 * (Define a state REQUIRED)
 *
 * export interface CollapsibleState {
 * 	open: boolean;
 * }
 * const initialState: CollapsibleState = { open: false };
 *
 * (REQUIRED END)
 *
 * (Context creation OPTIONAL)
 *
 * export const CollapsibleContext = SCC<CollapsibleState>({
 *  // Defines values if Context is used before anyone can define it
 * 	state: initialState,
 * 	setState: () => {},
 * 	initialState,
 * });
 * export const useCollapsible = () => useContext(CollapsibleContext);
 *
 * (OPTIONAL END)
 *
 * (Define your component adding StateCombineProps<CollapsibleState> in prop type)
 *
 * (Export StateCombineHOC({
 *	comp: Collapsible,
 *	options: { initialState, context: CollapsibleContext, contextInitial: {} },
 * })
 */

/**
 * What's needed
 * Higher => StateCombine => Lower
 * 
 * Lower sets defaults when first creating StateCombine
 * Higher sets values
 * 
 * Lower's state is controlled by StateCombine
 * Higher has priority over StateCombine's state
 * 
 * StateCombine's job is to provide valid state to Lower
 * StateCombine will deep merge stateCombineState and higherState in that order
 * StateCombine will mirror higherSetState if available, if not, stateCombineSetState will be used instead
 * 
 * HIGHER
 * 
 * STATE COMBINE
 * 	to LowerGenerator:
 * 		initialState
 * 		context
 * 		contextExtra
 *	to LowerProps:
 *		state
 *		setState
			setStateCombine
			initialState
			lowerProps
 * 		
 * 	to Higher:
 * 		state
 * 		setState
 * 		lowerProps
 * LOWER
 */

export type StateCombineProps<T> = {
	/**
	 * Will be merged with Component's initialState and override it, and will only be used when Component is created
	 *
	 * Meaning if you want something, make sure it's there the first time Component is rendered
	 */
	initialState: T;
	/**
	 * Will be merged with Component's state and override it, on every render.
	 */
	state: T;
	/**
	 * This be called instead of Component's setState; if defined.
	 */
	setState: Dispatch<SetStateAction<T>>;
};
export type SCP<T> = StateCombineProps<T>;

// type LSO = LS<A=any,B=any>;

// Lower Component Generator Props
type LCGP<LP extends {}, LS, CP> = {
	comp: (v: LCP<LS, LP>) => any;
	options: LCGO<LS, CP>;
};
// Lower Component Props
export type LCP<LS, LP extends {} = {}> = LP & SCP<LS> & { setStateMerge: Dispatch<RecursivePartial<LS>> };
// Higher Component Exposed Props (the most flexible of all)
type HCP<LP extends {}, LS> = LP & Partial<SCP<RecursivePartial<LS>>>;

//#region Context
export const StateCombineContext = <LS, CP = {}>(initial: ContextProps<LS, CP>) => createContext(initial);
export const SCC = StateCombineContext;
type ContextProps<LS, CP> = SCP<LS> & CP;
interface LCGO<LS, CP> {
	/**
	 * Component's initial state, will define default properties in case upInitialState doesn't provide them
	 *
	 * This object makes sure Component Wrapped will always have a valid State
	 * */
	initialState: LS;
	/** If your context is handled by StateCombine you NEED to pass a contextInitial  */
	context?: Context<ContextProps<LS, CP>>;
	/** Defines initial values for context, bc if Context has non-nullable props, those will not be set */
	contextInitial?: CP;
}
//#endregion

const mergeState = <T extends any>(a: T, ...b: (RecursivePartial<T> | undefined)[]): T => deepMerge(a, ...b);

const StateCombineHOC = <LP extends {}, LS, CP>({ comp: CompHOC, options }: LCGP<LP, LS, CP>) => {
	// HOC Component creator execution, this scope is ran once for every component that exports an HOC

	const StateCombine = (props: HCP<LP, LS>) => {
		const initialState = useMemo(
			() => mergeState(cloneDeep(options.initialState), cloneDeep(props.initialState)),
			[props.initialState]
		);
		let [s, ss] = useState<LS>(() => mergeState(cloneDeep(initialState), cloneDeep(props.state)));
		// If upSetState was provided, current state is ourState + upState, else, it's just ourState.
		// If upSetState was provided, setState = upSetState, else setState = ourSetState
		const [state, setState] = [mergeState(s, props.state), (props.setState ?? ss) as typeof ss];

		// Define new component with redefined props
		const comp = (
			<CompHOC
				{...props}
				initialState={initialState}
				state={state}
				setState={setState}
				setStateMerge={(v) => setState((s) => merge(clone(s), v))}
			/>
		);

		// Return either the component inside a context, or the component itself if the context invalid
		return options.context && options.contextInitial ? (
			<options.context.Provider value={{ state, setState, initialState, ...options.contextInitial }}>
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
