import {
	ResponseFetchAny,
	ResponseFetchErrors,
	ResponseFetchValid,
	responseIsError,
	responseIsValid,
} from '@common/rxjs/rxjs_utils';
import { useEffect, useRef } from 'react';

interface QueryActionOptions<T extends ResponseFetchAny> {
	/** On valid */
	onValid?: (v: ResponseFetchValid<T>) => void;
	/** On error */
	onError?: (v: ResponseFetchErrors<T>) => void;
	/** If not valid, or error */
	onDefault?: (v: T) => void;
	/** Always gets executed when query returns */
	onResponse?: (v: T) => void;
}
export const useQueryAction = <T extends ResponseFetchAny>(response: T, options?: QueryActionOptions<T>, ...deps) => {
	// const changed = useResponseChanged(response);
	useEffect(() => {
		// if(!changed)return; // Prevent run if response was undefined
		options?.onResponse?.(response);
		if (response) {
			const valid = responseIsValid(response);
			if (valid) {
				options?.onValid?.(valid);
				return;
			}
			const error = responseIsError(response);
			if (error) {
				//@ts-ignore
				options?.onError?.(error);
				return;
			}
		}
		options?.onDefault?.(response);
	}, [response, ...deps]);
};
