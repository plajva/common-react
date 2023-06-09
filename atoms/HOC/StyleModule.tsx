import React, { ComponentType, FunctionComponent } from 'react';
import { classNameFind } from '../../utils';

const StyleModule = <T extends React.HTMLAttributes<HTMLElement>>(
	Comp: FunctionComponent<T>,
	styleModule: object,
	styles: string[]
): FunctionComponent<T> => {
	return ({ style, ...props }) => (
		<Comp {...(props as T)} style={`${style ? style : ''} ${classNameFind(styleModule, ...styles)}`} />
	);
};

export default StyleModule;
