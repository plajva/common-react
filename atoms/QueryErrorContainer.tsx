/**
 * Component renders as a parent <div> and child X when response is loading|error|feedback,
 * or just renders as children when response is valid
 */
import React, { CSSProperties, ReactNode } from 'react';
import s from './QueryErrorContainer.module.scss';
import { useTheme } from '@common/atoms/Theme';
import { cnf } from '@common/utils';
import { ResponseFetch, ResponseFetchValid, responseIsError, responseIsValid } from '@common/rxjs/rxjs_utils';
import LoaderReact from 'react-loader-spinner';

export interface QueryErrorContainerProps<T> {
    response?: T;
    /**
     * Exclude null/undefined and any of the status/loading properties from type
     */
    children?: (v: ResponseFetchValid<T>) => any;
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

const QueryErrorContainer = <T extends (ResponseFetch<any> | undefined | null)>({
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
                            <LoaderReact type='Rings' height={60} width={60} />
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
    }else if (!responseIsValid(response)){
        let { errors, loading, message, ...rest } = response;
        return render({ loading, error: (errors && message) || undefined });
    }else {
        // let { ...rest } = response;
        //@ts-ignore
        return render({ children: children(response), success: true });
    }
};

export default QueryErrorContainer;
