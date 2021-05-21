import Backdrop from '@common/atoms/Backdrop';
import LoaderReact from 'react-loader-spinner';

export interface LoaderOption {
    isLoading: boolean;
}

const Loader = (props: LoaderOption) => {
    return (
        (props.isLoading && (
            <Backdrop active={true}>
                <LoaderReact type='TailSpin' height={100} width={100} />
            </Backdrop>
        )) ||
        null
    );
};

export default Loader;
