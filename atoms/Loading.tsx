import React from 'react';
import ReactLoading, { LoadingProps as _LoadingProps } from 'react-loading';

interface LoadingProps extends React.SVGAttributes<HTMLElement> {
	size?: any;
}

// const _Loading = React.createElement(ReactLoading, {color:'currentColor', width:{size},height:{size}, ...props});

const Loading = ({ size, ...props }: Omit<LoadingProps, 'type'> & _LoadingProps) => (
	React.createElement(ReactLoading, {color:'currentColor', width:size,height:size, ...props})
	
);
export default Loading;
