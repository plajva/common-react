import Backdrop from '@common/atoms/Backdrop';
import LoaderReact from 'react-loader-spinner';

export interface LoaderOption {
    isLoading: Boolean;
}

const Loader = (props: LoaderOption) => {
    return (
        props.isLoading && (
            <Backdrop active={true}>
                <LoaderReact type='TailSpin' color='#00BFFF' height={100} width={100} secondaryColor='#FF0000' />
            </Backdrop>
        )
    );
};

export default Loader;
