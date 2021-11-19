import { useForm } from './Form';
import debounce from 'lodash/debounce';
import { useCallback, useEffect, useState } from 'react';

export interface AutoSubmitProps {}

const AutoSubmit = (props: AutoSubmitProps) => {
	const { submit, state } = useForm();
	const [first, setFirts] = useState(true);

	const triggerSubmit = useCallback(
		debounce(() => {
			submit();
		}, 500),
		[]
	);

	useEffect(() => {
		!first && triggerSubmit();
		setFirts(false);
	}, [state.values, first, triggerSubmit]);

	return null;
};

export default AutoSubmit;
