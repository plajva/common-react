import { useFormikContext } from 'formik';
import debounce from 'lodash/debounce';
import { useCallback, useEffect, useState } from 'react';

export interface AutoSubmitProps {}

const AutoSubmit = (props: AutoSubmitProps) => {
    const { submitForm, values } = useFormikContext();
    const [first, setFirts] = useState(true);

    const triggerSubmit = useCallback(
        debounce(() => {
            submitForm();
        }, 500),
        []
    );

    useEffect(() => {
        !first && triggerSubmit();
        setFirts(false);
    }, [values, first, triggerSubmit]);

    return null;
};

export default AutoSubmit;
