import React, { ComponentType, FunctionComponent, useContext } from 'react';
import { classNameFind } from '../../utils';

const StyleModule = <T extends React.HTMLAttributes<HTMLElement>>(Comp: ComponentType<T>, styleModule:object, styles:string[]):FunctionComponent<T> => {
	return ({style,...props}) => 
	<Comp 
	
	{...props as T} 
	
	style={`${style?style:''} ${classNameFind(styleModule, ...styles)}`}
	
	/>;
}

export default StyleModule;