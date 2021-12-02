/**
 * Component renders as a parent <div> and child X when response is loading|error|feedback,
 * or just renders as children when response is valid
 */
import LoaderReact from '@common/atoms/Loading';
import { useTheme } from '@common/atoms/Theme';
import { ResponseFetch, ResponseFetchValid, responseIsError, responseIsValid } from '@common/rxjs/rxjs_utils';
import { cnf } from '@common/utils';
import React from 'react';
import { ReactNode } from 'react';
import s from './QueryErrorContainer.module.scss';

export interface QueryErrorContainerProps<T> {
	response?: T;
	/**
	 * Exclude null/undefined and any of the status/loading properties from type
	 */
	children?: ((v: ResponseFetchValid<T>) => any) | ReactNode;
	inline?: boolean;
	minWidth?: number;
	minHeight?: number;
	/**
	 * Will make this component feedback, meaning undefined response is allowed and not shown
	 * And a success will make color green and render child
	 */
	feedback?: boolean;
	/**
	 * Shown when response evaluates to false
	 */
	childrenDefault?: any;
}

// ! This code can be done MUCH MUCH CLEANER, maybe not needed at all
const QueryErrorContainer = <T extends ResponseFetch<any> | undefined | null>({
	className,
	response,
	children,
	inline,
	style,
	minWidth,
	minHeight,
	feedback,
	childrenDefault,
	...props
}: QueryErrorContainerProps<T> & React.HTMLAttributes<HTMLDivElement>) => {
	const theme = useTheme().name;
	// An idea to keep elements in DOM even when fetch loading
	// const validResponse = useRef<ResponseFetchValid<T> | undefined>(undefined);

	const render = ({ loading, error, children: vchildren, success }: { loading?; error?; children?; success? }) => {
		// const containerStyles: CSSProperties = { textAlign: LOrE ? 'center' : undefined };
		const _className = cnf(
			s,
			`comp`,
			theme,
			className,
			error ? 'error' : loading ? 'loading' : feedback ? 'feedback' : '',
			success ? 'success' : '',
			inline ? 'inline' : ''
		);

		return (
			<>
				{((loading || error || feedback) && (
					<div className={_className} style={{ minWidth, minHeight, ...style }} {...props}>
						{/* <div className={cnf(s, 'text')}> */}
						{error ? (
							error
						) : loading ? (
							<LoaderReact type='bubbles' height={60} width={60} />
						) : feedback ? (
							vchildren
						) : (
							''
						)}
						{/* </div> */}
					</div>
				)) ||
					vchildren ||
					''}
			</>
		);
	};

	let error;
	if (!children) {
		error = `Children is '${children}'`;
		return render({ error });
	}
	if (!response) {
		// error = `Response is '${response}'`;
		return childrenDefault ? render({ children: childrenDefault }) : render({ error });
	} else if (responseIsError(response) || response.loading) {
		let { errors, loading, message, ...rest } = response as any;
		return render({ loading, error: (errors && message) || undefined });
	} else if (responseIsValid(response)) {
		//@ts-ignore
		return render({ children: typeof children === 'function'? children(response):children, success: true });
	}
	return render({ error });
};

export interface QueryLoadingContainerProps<T> extends React.HTMLAttributes<HTMLElement> {
	response?: T;
	/**
	 * Exclude null/undefined and any of the status/loading properties from type
	 */
	children?: ((v: T | null | undefined) => any) | ReactNode;
	size?: string | number;
}

export const QueryLoadingContainer = <T extends ResponseFetch<any> | undefined | null>({
	response,
	children,
	size,
	...props
}: QueryLoadingContainerProps<T>) => {
	const theme = useTheme().name;
	return (
		<div {...props} style={{ position: 'relative', ...props.style }}>
			{(typeof children === 'function' && children(response)) || children}
			{response?.loading && (
				<div
					style={{
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						position: 'absolute',
						top: 0,
						left: 0,
						width: '100%',
						height: '100%',
						// background: '#7b54a371',
						// backdropFilter: 'blur(2px)',
					}}
					className={cnf(s, 'border-radius-2 loading-container', theme)}
				>
					<LoaderReact type='spin' height={size || 30} width={size || 30} />
				</div>
			)}
		</div>
	);
};

export default QueryErrorContainer;
