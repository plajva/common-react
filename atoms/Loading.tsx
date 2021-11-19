import ReactLoading, { LoadingProps as _LoadingProps } from 'react-loading';

interface LoadingProps extends React.SVGAttributes<HTMLElement> {
	// color?: string,
	// stroke?: string,
	// fill?: string,
}

const Loading = (props: Omit<LoadingProps, 'type'> & _LoadingProps) => {
	// const {color, type}
	return <ReactLoading color='currentColor' {...props} />;
};

export default Loading;
