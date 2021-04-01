import { useCallback, useEffect } from 'react';
import { useFormikContext } from 'formik';
import debounce from 'lodash/debounce';

export interface AutoSubmitProps {}

const AutoSubmit = (props: AutoSubmitProps) => {
    const { submitForm, values } = useFormikContext();

    const triggerSubmit = useCallback(
        debounce(() => {
            submitForm();
        }, 500),
        []
    );

    useEffect(() => {
        triggerSubmit();
    }, [values]);

    return null;
};

export default AutoSubmit;
