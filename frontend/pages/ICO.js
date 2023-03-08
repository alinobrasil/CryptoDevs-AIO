import React from 'react'
import styles from "../styles/Home.module.css";
import { BigNumber, Contract, providers, utils } from "ethers";

import { useContext, useEffect, useRef, useState } from "react";
import AppContext from "../AppContext";

import {
    WHITELIST_CONTRACT_ADDRESS,
    WHITELIST_CONTRACT_ABI,
    NFT_CONTRACT_ABI,
    NFT_CONTRACT_ADDRESS,
    TOKEN_CONTRACT_ABI,
    TOKEN_CONTRACT_ADDRESS,
    CRYPTODEVS_DAO_ABI,
    CRYPTODEVS_DAO_CONTRACT_ADDRESS,
    CRYPTODEVS_NFT_ABI,
    CRYPTODEVS_NFT_CONTRACT_ADDRESS,
} from "../constants";

export default function ICO() {
    const zero = BigNumber.from(0);

    const context = useContext(AppContext);
    const {
        walletConnected,
        setWalletConnected,
        web3ModalRef,
        getProviderOrSigner,
        connectWallet,
    } = context;
    //ICO ----------------------------------------------

    // tokensToBeClaimed keeps track of the number of tokens that can be claimed
    // based on the Crypto Dev NFT's held by the user for which they havent claimed the tokens
    const [tokensToBeClaimed, setTokensToBeClaimed] = useState(zero);
    // balanceOfCryptoDevTokens keeps track of number of Crypto Dev tokens owned by an address
    const [balanceOfCryptoDevTokens, setBalanceOfCryptoDevTokens] =
        useState(zero);
    // amount of the tokens that the user wants to mint
    const [tokenAmount, setTokenAmount] = useState(zero);
    // tokensMinted is the total number of tokens that have been minted till now out of 10000(max total supply)
    const [tokensMinted, setTokensMinted] = useState(zero);
    // isOwner gets the owner of the Token Contract
    const [isOwnerICO, setIsOwnerICO] = useState(false);
    const [loadingICO, setLoadingICO] = useState(false);

    useEffect(() => {
        // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
        if (!walletConnected) {
            connectWallet()

            // For ICO -------------------------------------------
            getTotalTokensMinted();
            getBalanceOfCryptoDevTokens();
            getTokensToBeClaimed();
            // withdrawCoins();

        }
    }, [walletConnected]);







    /**
      * getTokensToBeClaimed: checks the balance of tokens that can be claimed by the user
      */
    const getTokensToBeClaimed = async () => {
        try {
            // Get the provider from web3Modal, which in our case is MetaMask
            // No need for the Signer here, as we are only reading state from the blockchain
            const provider = await getProviderOrSigner();
            // Create an instance of NFT Contract
            const nftContract = new Contract(
                NFT_CONTRACT_ADDRESS,
                NFT_CONTRACT_ABI,
                provider
            );
            // Create an instance of tokenContract
            const tokenContract = new Contract(
                TOKEN_CONTRACT_ADDRESS,
                TOKEN_CONTRACT_ABI,
                provider
            );
            // We will get the signer now to extract the address of the currently connected MetaMask account
            const signer = await getProviderOrSigner(true);
            // Get the address associated to the signer which is connected to  MetaMask
            const address = await signer.getAddress();
            // call the balanceOf from the NFT contract to get the number of NFT's held by the user
            const balance = await nftContract.balanceOf(address);
            // balance is a Big number and thus we would compare it with Big number `zero`
            if (balance === zero) {
                setTokensToBeClaimed(zero);
            } else {
                // amount keeps track of the number of unclaimed tokens
                var amount = 0;
                // For all the NFT's, check if the tokens have already been claimed
                // Only increase the amount if the tokens have not been claimed
                // for a an NFT(for a given tokenId)
                for (var i = 0; i < balance; i++) {
                    const tokenId = await nftContract.tokenOfOwnerByIndex(address, i);
                    const claimed = await tokenContract.tokenIdsClaimed(tokenId);
                    if (!claimed) {
                        amount++;
                    }
                }
                //tokensToBeClaimed has been initialized to a Big Number, thus we would convert amount
                // to a big number and then set its value
                setTokensToBeClaimed(BigNumber.from(amount));
            }
        } catch (err) {
            console.error(err);
            setTokensToBeClaimed(zero);
        }
    };

    /**
     * getBalanceOfCryptoDevTokens: checks the balance of Crypto Dev Tokens's held by an address
     */
    const getBalanceOfCryptoDevTokens = async () => {
        try {
            // Get the provider from web3Modal, which in our case is MetaMask
            // No need for the Signer here, as we are only reading state from the blockchain
            const provider = await getProviderOrSigner();
            // Create an instace of token contract
            const tokenContract = new Contract(
                TOKEN_CONTRACT_ADDRESS,
                TOKEN_CONTRACT_ABI,
                provider
            );
            // We will get the signer now to extract the address of the currently connected MetaMask account
            const signer = await getProviderOrSigner(true);
            // Get the address associated to the signer which is connected to  MetaMask
            const address = await signer.getAddress();
            // call the balanceOf from the token contract to get the number of tokens held by the user
            const balance = await tokenContract.balanceOf(address);
            // balance is already a big number, so we dont need to convert it before setting it
            setBalanceOfCryptoDevTokens(balance);
        } catch (err) {
            console.error(err);
            setBalanceOfCryptoDevTokens(zero);
        }
    };

    /**
     * mintCryptoDevToken: mints `amount` number of tokens to a given address
     */
    const mintCryptoDevToken = async (amount) => {
        try {
            // We need a Signer here since this is a 'write' transaction.
            // Create an instance of tokenContract
            const signer = await getProviderOrSigner(true);
            // Create an instance of tokenContract
            const tokenContract = new Contract(
                TOKEN_CONTRACT_ADDRESS,
                TOKEN_CONTRACT_ABI,
                signer
            );
            // Each token is of `0.001 ether`. The value we need to send is `0.001 * amount`
            const value = 0.001 * amount;
            const tx = await tokenContract.mint(amount, {
                // value signifies the cost of one crypto dev token which is "0.001" eth.
                // We are parsing `0.001` string to ether using the utils library from ethers.js
                value: utils.parseEther(value.toString()),
            });
            setLoadingICO(true);
            // wait for the transaction to get mined
            await tx.wait();
            setLoadingICO(false);
            window.alert("Sucessfully minted Crypto Dev Tokens");
            await getBalanceOfCryptoDevTokens();
            await getTotalTokensMinted();
            await getTokensToBeClaimed();
        } catch (err) {
            console.error(err);
        }
    };

    /**
     * claimCryptoDevTokens: Helps the user claim Crypto Dev Tokens
     */
    const claimCryptoDevTokens = async () => {
        try {
            // We need a Signer here since this is a 'write' transaction.
            // Create an instance of tokenContract
            const signer = await getProviderOrSigner(true);
            // Create an instance of tokenContract
            const tokenContract = new Contract(
                TOKEN_CONTRACT_ADDRESS,
                TOKEN_CONTRACT_ABI,
                signer
            );
            const tx = await tokenContract.claim();
            setLoadingICO(true);
            // wait for the transaction to get mined
            await tx.wait();
            setLoadingICO(false);
            window.alert("Sucessfully claimed Crypto Dev Tokens");
            await getBalanceOfCryptoDevTokens();
            await getTotalTokensMinted();
            await getTokensToBeClaimed();
        } catch (err) {
            console.error(err);
        }
    };

    /**
     * getTotalTokensMinted: Retrieves how many tokens have been minted till now
     * out of the total supply
     */
    const getTotalTokensMinted = async () => {
        try {
            // Get the provider from web3Modal, which in our case is MetaMask
            // No need for the Signer here, as we are only reading state from the blockchain
            const provider = await getProviderOrSigner();
            // Create an instance of token contract
            const tokenContract = new Contract(
                TOKEN_CONTRACT_ADDRESS,
                TOKEN_CONTRACT_ABI,
                provider
            );
            // Get all the tokens that have been minted
            const _tokensMinted = await tokenContract.totalSupply();
            setTokensMinted(_tokensMinted);
        } catch (err) {
            console.error(err);
        }
    };

    /**
     * getOwner: gets the contract owner by connected address
     */
    const getOwnerICO = async () => {
        try {
            const provider = await getProviderOrSigner();
            const tokenContract = new Contract(
                TOKEN_CONTRACT_ADDRESS,
                TOKEN_CONTRACT_ABI,
                provider
            );
            // call the owner function from the contract
            const _ownerICO = await tokenContract.owner();
            // we get signer to extract address of currently connected Metamask account
            const signer = await getProviderOrSigner(true);
            // Get the address associated to signer which is connected to Metamask
            const address = await signer.getAddress();
            if (address.toLowerCase() === _ownerICO.toLowerCase()) {
                setIsOwnerICO(true);
            }
        } catch (err) {
            console.error(err.message);
        }
    };

    /**
     * withdrawCoins: withdraws ether and tokens by calling
     * the withdraw function in the contract
     */
    const withdrawCoins = async () => {
        try {
            const signer = await getProviderOrSigner(true);
            const tokenContract = new Contract(
                TOKEN_CONTRACT_ADDRESS,
                TOKEN_CONTRACT_ABI,
                signer
            );

            // execute function to withdraw coins
            const tx = await tokenContract.withdraw();
            setLoadingICO(true);
            await tx.wait();
            setLoadingICO(false);
            await getOwnerICO();
        } catch (err) {
            console.error(err);
        }
    };

    const renderButton_ICO = () => {
        // If we are currently waiting for something, return a loading button
        if (loadingICO) {
            return (
                <div>
                    <button className={styles.button}>Loading...</button>
                </div>
            );
        }
        // if owner is connected, withdrawCoins() is called
        if (walletConnected && isOwnerICO) {
            return (
                <div>
                    <button className={styles.button1} onClick={withdrawCoins}>
                        Withdraw Coins
                    </button>
                </div>
            );
        }
        // If tokens to be claimed are greater than 0, Return a claim button
        if (tokensToBeClaimed > 0) {
            return (
                <div>
                    <div className={styles.description}>
                        {tokensToBeClaimed * 10} Tokens can be claimed!
                    </div>
                    <button className={styles.button} onClick={claimCryptoDevTokens}>
                        Claim Tokens
                    </button>
                </div>
            );
        }
        // If user doesn't have any tokens to claim, show the mint button
        return (
            <div style={{ display: "flex-col" }}>
                <div>
                    <input
                        type="number"
                        placeholder="Amount of Tokens"
                        // BigNumber.from converts the `e.target.value` to a BigNumber
                        onChange={(e) => setTokenAmount(BigNumber.from(e.target.value))}
                        className={styles.input}
                    />
                </div>

                <button
                    className={styles.button}
                    disabled={!(tokenAmount > 0)}
                    onClick={() => mintCryptoDevToken(tokenAmount)}
                >
                    Mint Tokens
                </button>
            </div>
        );
    };

    const ICO_pagecontent = () => {
        return (
            <>
                <div>
                    <h1 className={styles.title}>Crypto Devs ICO</h1>
                    <div className={styles.description}>
                        You can claim or mint Crypto Dev tokens here
                    </div>
                    {walletConnected ? (
                        <div>
                            <div className={styles.description}>
                                {/* Format Ether helps us in converting a BigNumber to string */}
                                You have minted {Number(utils.formatEther(balanceOfCryptoDevTokens)).toFixed(2)} Crypto
                                Dev Tokens
                            </div>
                            <div className={styles.description}>
                                {/* Format Ether helps us in converting a BigNumber to string */}
                                Overall {utils.formatEther(tokensMinted)}/10000 have been minted!!!
                            </div>
                            {renderButton_ICO()}
                        </div>
                    ) : (
                        <button onClick={connectWallet} className={styles.button}>
                            Connect your wallet
                        </button>
                    )}
                </div>

                <div>
                    <img src="./cryptodevs/3.svg"></img>
                </div>

            </>
        )
    }

    return (
        <div>{ICO_pagecontent()}</div>
    )
}
