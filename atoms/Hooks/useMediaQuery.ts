import { useTheme, ThemeI } from '@common/atoms/Theme';
import { useDebugValue, useEffect, useState } from 'react';

interface QueryInputProps {
	(theme: ThemeI): string;
}

interface OptionsProps {
	defaultMatches?: boolean;
	matchMedia?: any;
}

export default function useMediaQuery(queryInput: string | QueryInputProps, options: OptionsProps = {}) {
	const theme = useTheme();

	let query = typeof queryInput === 'function' ? queryInput(theme) : queryInput;
	query = query.replace(/^@media( ?)/m, '');

	const supportMatchMedia = typeof window !== 'undefined' && typeof window.matchMedia !== 'undefined';

	const { defaultMatches = false, matchMedia = supportMatchMedia ? window.matchMedia : null } = {
		...options,
	};

	const [match, setMatch] = useState(() => {
		if (supportMatchMedia) {
			return matchMedia(query).matches;
		}
		return defaultMatches;
	});

	useEffect(() => {
		let active = true;

		if (!supportMatchMedia) {
			return undefined;
		}

		const queryList = matchMedia(query);
		const updateMatch = () => {
			if (active) {
				setMatch(queryList.matches);
			}
		};
		updateMatch();
		queryList.addEventListener('change', updateMatch);
		return () => {
			active = false;
			queryList.removeEventListener('change', updateMatch);
		};
	}, [query, matchMedia, supportMatchMedia]);

	if (process.env.NODE_ENV !== 'production') {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		useDebugValue({ query, match });
	}

	return match;
}
