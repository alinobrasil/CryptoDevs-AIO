import React from 'react'
import AppContext from "../AppContext";
import { useContext, useEffect, useRef, useState } from "react";
import styles from "../styles/Home.module.css";
import { BigNumber, Contract, providers, utils } from "ethers";
import { WHITELIST_CONTRACT_ADDRESS, WHITELIST_CONTRACT_ABI, } from "../constants";
function whitelist() {
    const context = useContext(AppContext);
    const {
        walletConnected,
        setWalletConnected,
        web3ModalRef,
        getProviderOrSigner,
        connectWallet,
    } = context;

    useEffect(() => {
        // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
        if (!walletConnected) {

            connectWallet()
                .then(() => {
                    // setWalletConnected(true);
                    checkIfAddressInWhitelist();
                    getNumberOfWhitelisted();
                })
        }

        console.log("Wallet connected status:  ", walletConnected)
    }, [walletConnected]);


    //WHITELIST ---------------------------------------------------------------
    // joinedWhitelist keeps track of whether the current metamask address has joined the Whitelist or not
    const [joinedWhitelist, setJoinedWhitelist] = useState(false);
    // numberOfWhitelisted tracks the number of addresses's whitelisted
    const [numberOfWhitelisted, setNumberOfWhitelisted] = useState(0);
    const [loadingWhitelist, setLoadingWhitelist] = useState(false);

    /**
      * addAddressToWhitelist: Adds the current connected address to the whitelist
      */
    const addAddressToWhitelist = async () => {
        try {
            // We need a Signer here since this is a 'write' transaction.
            const signer = await getProviderOrSigner(true);
            // Create a new instance of the Contract with a Signer, which allows
            // update methods
            const whitelistContract = new Contract(
                WHITELIST_CONTRACT_ADDRESS,
                WHITELIST_CONTRACT_ABI,
                signer
            );
            // call the addAddressToWhitelist from the contract
            const tx = await whitelistContract.addAddressToWhitelist();
            setLoadingWhitelist(true);
            // wait for the transaction to get mined
            await tx.wait();
            setLoadingWhitelist(false);
            // get the updated number of addresses in the whitelist
            await getNumberOfWhitelisted();
            setJoinedWhitelist(true);
        } catch (err) {
            console.error(err);
        }
    };

    /**
     * getNumberOfWhitelisted:  gets the number of whitelisted addresses
     */
    const getNumberOfWhitelisted = async () => {
        try {
            // Get the provider from web3Modal, which in our case is MetaMask
            // No need for the Signer here, as we are only reading state from the blockchain
            const provider = await getProviderOrSigner();
            // We connect to the Contract using a Provider, so we will only
            // have read-only access to the Contract
            const whitelistContract = new Contract(
                WHITELIST_CONTRACT_ADDRESS,
                WHITELIST_CONTRACT_ABI,
                provider
            );
            // call the numAddressesWhitelisted from the contract
            const _numberOfWhitelisted =
                await whitelistContract.numAddressesWhitelisted();
            setNumberOfWhitelisted(_numberOfWhitelisted);
        } catch (err) {
            console.error(err);
        }
    };

    /**
     * checkIfAddressInWhitelist: Checks if the address is in whitelist
     */
    const checkIfAddressInWhitelist = async () => {
        try {
            const signer = await getProviderOrSigner(true);
            const whitelistContract = new Contract(
                WHITELIST_CONTRACT_ADDRESS,
                WHITELIST_CONTRACT_ABI,
                signer
            );
            // get address of metamask account
            const address = await signer.getAddress();

            // call the whitelistedAddresses from the contract
            const _joinedWhitelist = await whitelistContract.whitelistedAddresses(
                address
            );
            setJoinedWhitelist(_joinedWhitelist);
        } catch (err) {
            console.error(err);
        }
    };

    //contents of the whitelist page
    const whitelist_pagecontent = () => {
        return (
            <>
                <div>
                    <h1 className={styles.title}>Get on the WhiteList</h1>
                    <div className={styles.description}>
                        Get on the whitelist for early access to minting CryptoDevs NFTs. So far {numberOfWhitelisted} have already joined the Whitelist
                    </div>
                    {renderButton_whitelist()}
                </div>
                <div>
                    <img className={styles.image} src="./crypto-devs.svg" />
                </div>
            </>
        )
    }

    const renderButton_whitelist = () => {
        if (walletConnected) {
            if (joinedWhitelist) {
                return (
                    <div className={styles.description}>
                        Congrats. You're already on the whitelist!
                    </div>
                );
            } else if (loadingWhitelist) {
                return <button className={styles.button}>Loading...</button>;
            } else {
                return (
                    <button onClick={addAddressToWhitelist} className={styles.button}>
                        Join the Whitelist
                    </button>
                );
            }
        } else {
            return (
                <button onClick={connectWallet} className={styles.button}>
                    Connect your wallet
                </button>
            );
        }
    };

    return (
        <>
            {whitelist_pagecontent()}
        </>
    )
}

export default whitelist