import ReactLoading, { LoadingProps as _LoadingProps } from 'react-loading';

interface LoadingProps extends React.SVGAttributes<HTMLElement> {
	size?: any;
}

const Loading = ({ size, ...props }: Omit<LoadingProps, 'type'> & _LoadingProps) => (
	<ReactLoading color='currentColor' width={size} height={size} {...props} />
);
export default Loading;
