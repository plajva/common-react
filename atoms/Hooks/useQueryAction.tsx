import {
    responseIsValid,
    responseIsError,
    ResponseFetch,
    ResponseFetchValid,
    ResponseFetchErrors,
} from '@common/rxjs/rxjs_utils';
import { useEffect } from 'react';

interface QueryActionOptions<T> {
    onValid?: (v: ResponseFetchValid<T>) => void;
    onError?: (v: ResponseFetchErrors<T>) => void;
    onDefault?: (v: T) => void;
}
export const useQueryAction = <T extends (ResponseFetch<any> | undefined)>(response: T, options?: QueryActionOptions<T>) => {
    useEffect(() => {
        if (response) {
						const valid = responseIsValid(response);if(valid){options?.onValid && options.onValid(valid);return;}
						const error = responseIsError(response);if(error){options?.onError && options.onError(error);return;}
        }
				options?.onDefault && options.onDefault(response);
				return;
    }, [response]);
};
