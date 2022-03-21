import ReactLoading, { LoadingProps as _LoadingProps } from 'react-loading';

interface LoadingProps extends React.SVGAttributes<HTMLElement> {
	// color?: string,
	// stroke?: string,
	// fill?: string,
	size?: any;
}

const Loading = ({ size, ...props }: Omit<LoadingProps, 'type'> & _LoadingProps) => {
	// const {color, type}
	return <ReactLoading color='currentColor' width={size} height={size} {...props} />;
};

export default Loading;
