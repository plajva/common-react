import { Location } from 'history';
import router, { useLocation, useParams, useRouteMatch } from 'react-router-dom';
import { capitalize } from 'voca';

export const UseMatchParamsLocation = <M extends {} = {}, P extends {} = {}, L extends {} = {}>({
    children,
}: {
    children: (mpl: {m:router.match<M>, p: P, l: Location<L>}) => any;
}) => {
    const m = useRouteMatch<M>();
    const p = useParams<P>();
    const l = useLocation<L>();
		return children({m,p,l})
};

export const UseRouteMatch = <T extends {} = {}>({ children }: { children: (match: router.match<T>) => any }) => {
    const v = useRouteMatch<T>();
    return children(v);
};
export const UseParams = <T extends {} = {}>({ children }: { children: (params: T) => any }) => {
    const v = useParams<T>();
    return children(v);
};
export const UseLocation = <T extends {} = {}>({ children }: { children: (location: Location<T>) => any }) => {
    const v = useLocation<T>();
    return children(v);
};

export const LocationLast = () => <UseLocation>{(l) => <h2>{capitalize(l.pathname.split("/").slice(-1)[0])}</h2>}</UseLocation>;
