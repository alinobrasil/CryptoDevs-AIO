import { useState, useRef } from 'react';
import '../styles/globals.css'
import AppContext from './AppContext'


function MyApp({ Component, pageProps }) {

    const [walletConnected, setWalletConnected] = useState(false);
    const web3ModalRef = useRef();

    const getProviderOrSigner = async (needSigner = false) => {
        // Connect to Metamask
        // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
        const provider = await web3ModalRef.current.connect();
        const web3Provider = new providers.Web3Provider(provider);

        // If user is not connected to the Goerli network, let them know and throw an error
        const { chainId } = await web3Provider.getNetwork();
        if (chainId !== 5) {
            window.alert("Change the network to Goerli");
            throw new Error("Change network to Goerli");
        }

        if (needSigner) {
            const signer = web3Provider.getSigner();
            return signer;
        }
        return web3Provider;
    };


    return (
        <AppContext.Provider
            value={
                {
                    state: {
                        walletConnected,
                        setWalletConnected,
                        getProviderOrSigner,
                        web3ModalRef
                    }
                }
            }>
            <Component {...pageProps} />
        </AppContext.Provider>
    )
}

export default MyApp
