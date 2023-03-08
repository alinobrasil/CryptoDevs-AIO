import React from 'react'
import { useState, useEffect, useContext } from 'react';
import styles from "../styles/Home.module.css";
import AppContext from '../AppContext';
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
import { BigNumber, Contract, providers, utils } from "ethers";

export default function NFTminter() {

    const context = useContext(AppContext);

    const {
        walletConnected,
        setWalletConnected,
        web3ModalRef,
        getProviderOrSigner,
        connectWallet,
    } = context;

    //NFT minter/presale -------------------------------------
    // presaleStarted keeps track of whether the presale has started or not
    const [presaleStarted, setPresaleStarted] = useState(false);
    // presaleEnded keeps track of whether the presale ended
    const [presaleEnded, setPresaleEnded] = useState(false);
    // loading is set to true when we are waiting for a transaction to get mined
    const [loadingNFT, setLoadingNFT] = useState(false);
    // // // checks if the currently connected MetaMask wallet is the owner of the contract
    // const [isOwner, setIsOwner] = useState(false);
    // tokenIdsMinted keeps track of the number of tokenIds that have been minted
    const [tokenIdsMinted, setTokenIdsMinted] = useState("0");
    // isOwner gets the owner of the contract through the signed address
    const [isOwnerNFT, setIsOwnerNFT] = useState(false);


    useEffect(() => {
        console.log("wallet connected...", walletConnected)

        if (!walletConnected) {
            connectWallet()

            const _presaleStarted = checkIfPresaleStarted()
            if (_presaleStarted) {
                checkIfPresaleEnded();
            }
        }

        getTokenIdsMinted()
    }, [walletConnected])


    //For testing: Check state variables
    useEffect(() => {
        console.log("presaleStarted: ", presaleStarted)
    }, [presaleStarted])

    useEffect(() => {
        console.log("tokenIdsMinted: ", tokenIdsMinted)
    })


    // Set an interval which gets called every 5 seconds to check presale has ended
    const presaleEndedInterval = setInterval(async function () {
        const _presaleStarted = await checkIfPresaleStarted();
        if (_presaleStarted) {
            const _presaleEnded = await checkIfPresaleEnded();
            if (_presaleEnded) {
                clearInterval(presaleEndedInterval);
            }
        }
    }, 5 * 1000);

    // set an interval to get the number of token Ids minted every 5 seconds
    setInterval(async function () {
        await getTokenIdsMinted();
    }, 5 * 1000);

    /**
     * presaleMint: Mint an NFT during the presale
     */
    const presaleMint = async () => {
        try {
            // We need a Signer here since this is a 'write' transaction.
            const signer = await getProviderOrSigner(true);
            // Create a new instance of the Contract with a Signer, which allows
            // update methods
            const nftContract = new Contract(NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, signer);
            // call the presaleMint from the contract, only whitelisted addresses would be able to mint
            const tx = await nftContract.presaleMint({
                // value signifies the cost of one crypto dev which is "0.01" eth.
                // We are parsing `0.01` string to ether using the utils library from ethers.js
                value: utils.parseEther("0.01"),
            });
            setLoadingNFT(true);
            // wait for the transaction to get mined
            await tx.wait();
            setLoadingNFT(false);
            window.alert("You successfully minted a Crypto Dev!");
        } catch (err) {
            console.error(err);
        }
    };

    /**
     * publicMint: Mint an NFT after the presale
     */
    const publicMint = async () => {
        try {
            // We need a Signer here since this is a 'write' transaction.
            const signer = await getProviderOrSigner(true);
            // Create a new instance of the Contract with a Signer, which allows
            // update methods
            const nftContract = new Contract(NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, signer);
            // call the mint from the contract to mint the Crypto Dev
            const tx = await nftContract.mint({
                // value signifies the cost of one crypto dev which is "0.01" eth.
                // We are parsing `0.01` string to ether using the utils library from ethers.js
                value: utils.parseEther("0.01"),
            });
            setLoadingNFT(true);
            // wait for the transaction to get mined
            await tx.wait();
            setLoadingNFT(false);
            window.alert("You successfully minted a Crypto Dev!");

        } catch (err) {
            console.error(err);
        }
    };

    /**
     * startPresale: starts the presale for the NFT Collection
     */
    const startPresale = async () => {
        try {
            // We need a Signer here since this is a 'write' transaction.
            const signer = await getProviderOrSigner(true);
            // Create a new instance of the Contract with a Signer, which allows
            // update methods
            const nftContract = new Contract(NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, signer);
            // call the startPresale from the contract
            const tx = await nftContract.startPresale();
            setLoadingNFT(true);
            // wait for the transaction to get mined
            await tx.wait();
            setLoadingNFT(false);
            // set the presale started to true
            await checkIfPresaleStarted();
        } catch (err) {
            console.error(err);
        }
    };

    /**
      * checkIfPresaleStarted: checks if the presale has started by quering the `presaleStarted`
      * variable in the contract
      */
    const checkIfPresaleStarted = async () => {
        try {
            // Get the provider from web3Modal, which in our case is MetaMask
            // No need for the Signer here, as we are only reading state from the blockchain
            const provider = await getProviderOrSigner();
            const nftContract = new Contract(NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, provider);
            // call the presaleStarted from the contract
            const _presaleStarted = await nftContract.presaleStarted();
            if (!_presaleStarted) {
                await getOwner();
            }
            setPresaleStarted(_presaleStarted);
            return _presaleStarted;
        } catch (err) {
            console.error(err);
            return false;
        }
    };

    /**
     * checkIfPresaleEnded: checks if the presale has ended by quering the `presaleEnded`
     * variable in the contract
     */
    const checkIfPresaleEnded = async () => {
        try {
            // Get the provider from web3Modal, which in our case is MetaMask
            // No need for the Signer here, as we are only reading state from the blockchain
            const provider = await getProviderOrSigner();
            // We connect to the Contract using a Provider, so we will only
            // have read-only access to the Contract
            const nftContract = new Contract(NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, provider);
            // call the presaleEnded from the contract
            const _presaleEnded = await nftContract.presaleEnded();
            // _presaleEnded is a Big Number, so we are using the lt(less than function) instead of `<`
            // Date.now()/1000 returns the current time in seconds
            // We compare if the _presaleEnded timestamp is less than the current time
            // which means presale has ended
            const hasEnded = _presaleEnded.lt(Math.floor(Date.now() / 1000));
            if (hasEnded) {
                setPresaleEnded(true);
            } else {
                setPresaleEnded(false);
            }
            return hasEnded;
        } catch (err) {
            console.error(err);
            return false;
        }
    };

    /**
     * getOwner: calls the contract to retrieve the owner
     */
    const getOwnerNFT = async () => {
        try {
            const provider = await getProviderOrSigner();
            const nftContract = new Contract(NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, provider);

            // call the owner function from the contract
            const _owner = await nftContract.owner();
            const signer = await getProviderOrSigner(true);
            const address = await signer.getAddress();
            if (address.toLowerCase() === _owner.toLowerCase()) {
                setIsOwnerNFT(true);
            }
        } catch (err) {
            console.error(err.message);
        }
    };

    /**
     * getTokenIdsMinted: gets the number of tokenIds that have been minted
     */
    const getTokenIdsMinted = async () => {
        try {
            const provider = await getProviderOrSigner();
            const nftContract = new Contract(NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, provider);

            // call the tokenIds from the contract
            const _tokenIds = await nftContract.tokenIds();
            //_tokenIds is a `Big Number`. We need to convert the Big Number to a string
            setTokenIdsMinted(_tokenIds.toString());
        } catch (err) {
            console.error(err);
        }
    };


    const renderButton_NFT = () => {
        // If wallet is not connected, return a button which allows them to connect their wllet
        if (!walletConnected) {
            return (
                <button onClick={connectWallet} className={styles.button}>
                    Connect your wallet
                </button>
            );
        }

        // If we are currently waiting for something, return a loading button
        if (loadingNFT) {
            return <button className={styles.button}>Loading...</button>;
        }

        // If connected user is the owner, and presale hasnt started yet, allow them to start the presale
        if (isOwnerNFT && !presaleStarted) {
            return (
                <button className={styles.button} onClick={startPresale}>
                    Start Presale!
                </button>
            );
        }

        // If connected user is not the owner but presale hasn't started yet, tell them that
        if (!presaleStarted) {
            return (
                <div>
                    <div className={styles.description}>Presale hasnt started!</div>
                </div>
            );
        }

        // If presale started, but hasn't ended yet, allow for minting during the presale period
        if (presaleStarted && !presaleEnded) {
            return (
                <div>
                    <div className={styles.description}>
                        Presale is going on right now!
                        Get your early access NFT!
                    </div>
                    <button className={styles.button} onClick={presaleMint}>
                        Presale Mint 🚀
                    </button>
                </div>
            );
        }

        // If presale started and has ended, its time for public minting
        if (presaleStarted && presaleEnded) {
            return (

                <>
                    <button className={styles.button} onClick={publicMint}>
                        Public Mint 🚀
                    </button>
                    <p>Presale already ended.
                        Anyone can mint a CD NFT now.
                    </p>
                </>
            );
        }
    };

    const NFT_pagecontent = () => {
        return (
            <>
                <div>
                    <h1 className={styles.title}>NFT Minter</h1>
                    <div className={styles.description}>
                        This is an NFT collection for developers in Crypto. NFT holders get special privileges.
                    </div>
                    <div className={styles.description}>
                        {tokenIdsMinted}/20 have been minted
                    </div>
                    {renderButton_NFT()}
                </div>
                {/* <div>
          <img className={styles.image} src="./cryptodevs/0.svg" />
        </div> */}
            </>
        )
    }


    return (
        <>
            {NFT_pagecontent()}
        </>
    )
}
