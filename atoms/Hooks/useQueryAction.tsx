import {
	responseIsValid,
	responseIsError,
	ResponseFetch,
	ResponseFetchValid,
	ResponseFetchErrors,
	ResponseFetchAny,
} from '@common/rxjs/rxjs_utils';
import { useEffect } from 'react';

interface QueryActionOptions<T> {
	/** On valid */
	onValid?: (v: ResponseFetchValid<T>) => void;
	/** On error */
	onError?: (v: ResponseFetchErrors<T>) => void;
	/** If not valid, or error */
	onDefault?: (v: T) => void;
	/** Always gets executed when query returns */
	onResponse?: (v: T) => void;
}
export const useQueryAction = <T extends ResponseFetchAny>(
	response: T,
	options?: QueryActionOptions<T>
) => {
	useEffect(() => {
		options?.onResponse?.(response);
		if (response) {
			const valid = responseIsValid(response);
			if (valid) {
				options?.onValid?.(valid);
				return;
			}
			const error = responseIsError(response);
			if (error) {
				options?.onError?.(error);
				return;
			}
		}
		options?.onDefault?.(response);
		return;
	}, [response]);
};
