import { useState, useRef } from 'react';
import '../styles/globals.css'
import AppContext from '../AppContext'
import { providers, Contract } from "ethers";
import Web3Modal from "web3modal";
import Header from '../components/Header';
import Footer from '../components/Footer';


function MyApp({ Component, pageProps }) {

    const [walletConnected, setWalletConnected] = useState(false);
    const web3ModalRef = useRef();

    const getProviderOrSigner = async (needSigner = false) => {
        // Connect to Metamask
        // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
        const provider = await web3ModalRef.current.connect();
        // console.log("Provider")
        // console.log(provider)

        const web3Provider = new providers.Web3Provider(provider);
        // console.log("web3Provider")
        // console.log(web3Provider)

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


    const connectWallet = async () => {
        web3ModalRef.current = new Web3Modal({
            network: "goerli",
            providerOptions: {},
            disableInjectedProvider: false,
        });

        try {
            await getProviderOrSigner()
            setWalletConnected(true);

        } catch (err) {
            console.error(err);
        }

    };


    return (
        <AppContext.Provider
            value={
                {
                    walletConnected,
                    setWalletConnected,
                    getProviderOrSigner,
                    web3ModalRef,
                    connectWallet
                }
            }>

            <Header />
            <Component {...pageProps} />
            <Footer />

        </AppContext.Provider>
    )
}

export default MyApp
