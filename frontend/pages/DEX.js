import styles from "../styles/Home.module.css";
import React from 'react'
import { BigNumber, Contract, providers, utils } from "ethers";
import AppContext from "../AppContext";

//for DEX:
import { addLiquidity, calculateCD } from "../utils/addLiquidity";
import {
    getCDTokensBalance,
    getEtherBalance,
    getLPTokensBalance,
    getReserveOfCDTokens,
} from "../utils/getAmounts";
import {
    getTokensAfterRemove,
    removeLiquidity,
} from "../utils/removeLiquidity";
import { swapTokens, getAmountOfTokensReceivedFromSwap } from "../utils/swap";
import { useContext, useEffect, useRef, useState } from "react";






export default function DEX() {

    // Create a BigNumber `0`. used in ICO and Dex
    const zero = BigNumber.from(0);

    //DEX -----------------------------------
    // We have two tabs in this dapp, Liquidity Tab and Swap Tab. This variable
    // keeps track of which Tab the user is on. If it is set to true this means
    // that the user is on `liquidity` tab else he is on `swap` tab
    const [liquidityTab, setLiquidityTab] = useState(true);
    // // This variable is the `0` number in form of a BigNumber
    // const zero = BigNumber.from(0);
    /** Variables to keep track of amount */
    // `ethBalance` keeps track of the amount of Eth held by the user's account
    const [ethBalance, setEtherBalance] = useState(zero);
    // `reservedCD` keeps track of the Crypto Dev tokens Reserve balance in the Exchange contract
    const [reservedCD, setReservedCD] = useState(zero);
    // Keeps track of the ether balance in the contract
    const [etherBalanceContract, setEtherBalanceContract] = useState(zero);
    // cdBalance is the amount of `CD` tokens help by the users account
    const [cdBalance, setCDBalance] = useState(zero);
    // `lpBalance` is the amount of LP tokens held by the users account
    const [lpBalance, setLPBalance] = useState(zero);
    /** Variables to keep track of liquidity to be added or removed */
    // addEther is the amount of Ether that the user wants to add to the liquidity
    const [addEther, setAddEther] = useState(zero);
    // addCDTokens keeps track of the amount of CD tokens that the user wants to add to the liquidity
    // in case when there is no initial liquidity and after liquidity gets added it keeps track of the
    // CD tokens that the user can add given a certain amount of ether
    const [addCDTokens, setAddCDTokens] = useState(zero);
    // removeEther is the amount of `Ether` that would be sent back to the user based on a certain number of `LP` tokens
    const [removeEther, setRemoveEther] = useState(zero);
    // removeCD is the amount of `Crypto Dev` tokens that would be sent back to the user based on a certain number of `LP` tokens
    // that he wants to withdraw
    const [removeCD, setRemoveCD] = useState(zero);
    // amount of LP tokens that the user wants to remove from liquidity
    const [removeLPTokens, setRemoveLPTokens] = useState("0");
    /** Variables to keep track of swap functionality */
    // Amount that the user wants to swap
    const [swapAmount, setSwapAmount] = useState("");
    // This keeps track of the number of tokens that the user would receive after a swap completes
    const [tokenToBeReceivedAfterSwap, settokenToBeReceivedAfterSwap] =
        useState(zero);
    // Keeps track of whether  `Eth` or `Crypto Dev` token is selected. If `Eth` is selected it means that the user
    // wants to swap some `Eth` for some `Crypto Dev` tokens and vice versa if `Eth` is not selected
    const [ethSelected, setEthSelected] = useState(true);
    const [loadingDEX, setLoadingDEX] = useState(false);



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

            // For DEX ----------------------------
            getAmounts();

        }
    }, [walletConnected]);






    /**
      * getAmounts call various functions to retrive amounts for ethbalance,
      * LP tokens etc
      */
    const getAmounts = async () => {
        try {
            const provider = await getProviderOrSigner(false);
            const signer = await getProviderOrSigner(true);
            const address = await signer.getAddress();
            // get the amount of eth in the user's account
            const _ethBalance = await getEtherBalance(provider, address);
            // get the amount of `Crypto Dev` tokens held by the user
            const _cdBalance = await getCDTokensBalance(provider, address);
            // get the amount of `Crypto Dev` LP tokens held by the user
            const _lpBalance = await getLPTokensBalance(provider, address);
            // gets the amount of `CD` tokens that are present in the reserve of the `Exchange contract`
            const _reservedCD = await getReserveOfCDTokens(provider);
            // Get the ether reserves in the contract
            const _ethBalanceContract = await getEtherBalance(provider, null, true);
            setEtherBalance(_ethBalance);
            setCDBalance(_cdBalance);
            setLPBalance(_lpBalance);
            setReservedCD(_reservedCD);
            setReservedCD(_reservedCD);
            setEtherBalanceContract(_ethBalanceContract);
        } catch (err) {
            console.error(err);
        }
    };

    /**** SWAP FUNCTIONS ****/

    /**
     * swapTokens: Swaps  `swapAmountWei` of Eth/Crypto Dev tokens with `tokenToBeReceivedAfterSwap` amount of Eth/Crypto Dev tokens.
     */
    const _swapTokens = async () => {
        try {
            // Convert the amount entered by the user to a BigNumber using the `parseEther` library from `ethers.js`
            const swapAmountWei = utils.parseEther(swapAmount);
            // Check if the user entered zero
            // We are here using the `eq` method from BigNumber class in `ethers.js`
            if (!swapAmountWei.eq(zero)) {
                const signer = await getProviderOrSigner(true);
                setLoadingDEX(true);
                // Call the swapTokens function from the `utils` folder
                await swapTokens(
                    signer,
                    swapAmountWei,
                    tokenToBeReceivedAfterSwap,
                    ethSelected
                );
                setLoadingDEX(false);
                // Get all the updated amounts after the swap
                await getAmounts();
                setSwapAmount("");
            }
        } catch (err) {
            console.error(err);
            setLoadingDEX(false);
            setSwapAmount("");
        }
    };

    /**
     * _getAmountOfTokensReceivedFromSwap:  Returns the number of Eth/Crypto Dev tokens that can be received
     * when the user swaps `_swapAmountWEI` amount of Eth/Crypto Dev tokens.
     */
    const _getAmountOfTokensReceivedFromSwap = async (_swapAmount) => {
        try {
            // Convert the amount entered by the user to a BigNumber using the `parseEther` library from `ethers.js`
            const _swapAmountWEI = utils.parseEther(_swapAmount.toString());
            // Check if the user entered zero
            // We are here using the `eq` method from BigNumber class in `ethers.js`
            if (!_swapAmountWEI.eq(zero)) {
                const provider = await getProviderOrSigner();
                // Get the amount of ether in the contract
                const _ethBalance = await getEtherBalance(provider, null, true);
                // Call the `getAmountOfTokensReceivedFromSwap` from the utils folder
                const amountOfTokens = await getAmountOfTokensReceivedFromSwap(
                    _swapAmountWEI,
                    provider,
                    ethSelected,
                    _ethBalance,
                    reservedCD
                );
                settokenToBeReceivedAfterSwap(amountOfTokens);
            } else {
                settokenToBeReceivedAfterSwap(zero);
            }
        } catch (err) {
            console.error(err);
        }
    };

    /*** END ***/

    /**** ADD LIQUIDITY FUNCTIONS ****/

    /**
     * _addLiquidity helps add liquidity to the exchange,
     * If the user is adding initial liquidity, user decides the ether and CD tokens he wants to add
     * to the exchange. If he is adding the liquidity after the initial liquidity has already been added
     * then we calculate the crypto dev tokens he can add, given the Eth he wants to add by keeping the ratios
     * constant
     */
    const _addLiquidity = async () => {
        try {
            // Convert the ether amount entered by the user to Bignumber
            const addEtherWei = utils.parseEther(addEther.toString());
            // Check if the values are zero
            if (!addCDTokens.eq(zero) && !addEtherWei.eq(zero)) {
                const signer = await getProviderOrSigner(true);
                setLoadingDEX(true);
                // call the addLiquidity function from the utils folder
                await addLiquidity(signer, addCDTokens, addEtherWei);
                setLoadingDEX(false);
                // Reinitialize the CD tokens
                setAddCDTokens(zero);
                // Get amounts for all values after the liquidity has been added
                await getAmounts();
            } else {
                setAddCDTokens(zero);
            }
        } catch (err) {
            console.error(err);
            setLoadingDEX(false);
            setAddCDTokens(zero);
        }
    };

    /**** END ****/

    /**** REMOVE LIQUIDITY FUNCTIONS ****/

    /**
     * _removeLiquidity: Removes the `removeLPTokensWei` amount of LP tokens from
     * liquidity and also the calculated amount of `ether` and `CD` tokens
     */
    const _removeLiquidity = async () => {
        try {
            const signer = await getProviderOrSigner(true);
            // Convert the LP tokens entered by the user to a BigNumber
            const removeLPTokensWei = utils.parseEther(removeLPTokens);
            setLoadingDEX(true);
            // Call the removeLiquidity function from the `utils` folder
            await removeLiquidity(signer, removeLPTokensWei);
            setLoadingDEX(false);
            await getAmounts();
            setRemoveCD(zero);
            setRemoveEther(zero);
        } catch (err) {
            console.error(err);
            setLoadingDEX(false);
            setRemoveCD(zero);
            setRemoveEther(zero);
        }
    };

    /**
     * _getTokensAfterRemove: Calculates the amount of `Ether` and `CD` tokens
     * that would be returned back to user after he removes `removeLPTokenWei` amount
     * of LP tokens from the contract
     */
    const _getTokensAfterRemove = async (_removeLPTokens) => {
        try {
            const provider = await getProviderOrSigner();
            // Convert the LP tokens entered by the user to a BigNumber
            const removeLPTokenWei = utils.parseEther(_removeLPTokens);
            // Get the Eth reserves within the exchange contract
            const _ethBalance = await getEtherBalance(provider, null, true);
            // get the crypto dev token reserves from the contract
            const cryptoDevTokenReserve = await getReserveOfCDTokens(provider);
            // call the getTokensAfterRemove from the utils folder
            const { _removeEther, _removeCD } = await getTokensAfterRemove(
                provider,
                removeLPTokenWei,
                _ethBalance,
                cryptoDevTokenReserve
            );
            setRemoveEther(_removeEther);
            setRemoveCD(_removeCD);
        } catch (err) {
            console.error(err);
        }
    };

    /**** END ****/

    const renderButton_DEX = () => {
        // If wallet is not connected, return a button which allows them to connect their wllet
        if (!walletConnected) {
            return (
                <button onClick={connectWallet} className={styles.button}>
                    Connect your wallet
                </button>
            );
        }

        // If we are currently waiting for something, return a loading button
        if (loadingDEX) {
            return <button className={styles.button}>Loading...</button>;
        }

        if (liquidityTab) {
            return (
                <div>
                    <div className={styles.description}>
                        You have:
                        <br />
                        {/* Convert the BigNumber to string using the formatEther function from ethers.js */}
                        {Number(utils.formatEther(cdBalance)).toFixed(2)} Crypto Dev Tokens
                        <br />
                        {Number(utils.formatEther(ethBalance)).toFixed(2)} Ether
                        <br />
                        {Number(utils.formatEther(lpBalance)).toFixed(2)} Crypto Dev LP tokens
                    </div>
                    <div>
                        {/* If reserved CD is zero, render the state for liquidity zero where we ask the user
            how much initial liquidity he wants to add else just render the state where liquidity is not zero and
            we calculate based on the `Eth` amount specified by the user how much `CD` tokens can be added */}
                        {utils.parseEther(reservedCD.toString()).eq(zero) ? (
                            <div>
                                <input
                                    type="number"
                                    placeholder="Amount of Ether"
                                    onChange={(e) => setAddEther(e.target.value || "0")}
                                    className={styles.input}
                                />
                                <input
                                    type="number"
                                    placeholder="Amount of CryptoDev tokens"
                                    onChange={(e) =>
                                        setAddCDTokens(
                                            BigNumber.from(utils.parseEther(e.target.value || "0"))
                                        )
                                    }
                                    className={styles.input}
                                />
                                <button className={styles.button1} onClick={_addLiquidity}>
                                    Add
                                </button>
                            </div>
                        ) : (
                            <div>
                                <input
                                    type="number"
                                    placeholder="Amount of Ether"
                                    onChange={async (e) => {
                                        setAddEther(e.target.value || "0");
                                        // calculate the number of CD tokens that
                                        // can be added given  `e.target.value` amount of Eth
                                        const _addCDTokens = await calculateCD(
                                            e.target.value || "0",
                                            etherBalanceContract,
                                            reservedCD
                                        );
                                        setAddCDTokens(_addCDTokens);
                                    }}
                                    className={styles.input}
                                />
                                <div className={styles.inputDiv}>
                                    {/* Convert the BigNumber to string using the formatEther function from ethers.js */}
                                    {`You will need ${utils.formatEther(addCDTokens)} Crypto Dev
                  Tokens`}
                                </div>
                                <button className={styles.button1} onClick={_addLiquidity}>
                                    Add
                                </button>
                            </div>
                        )}
                        <div>
                            <input
                                type="number"
                                placeholder="Amount of LP Tokens"
                                onChange={async (e) => {
                                    setRemoveLPTokens(e.target.value || "0");
                                    // Calculate the amount of Ether and CD tokens that the user would receive
                                    // After he removes `e.target.value` amount of `LP` tokens
                                    await _getTokensAfterRemove(e.target.value || "0");
                                }}
                                className={styles.input}
                            />
                            <div className={styles.inputDiv}>
                                {/* Convert the BigNumber to string using the formatEther function from ethers.js */}
                                {`You will get ${Number(utils.formatEther(removeCD)).toFixed(2)} Crypto
              Dev Tokens and ${utils.formatEther(removeEther)} Eth`}
                            </div>
                            <button className={styles.button1} onClick={_removeLiquidity}>
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            );
        } else {
            return (
                <div>
                    <input
                        type="number"
                        placeholder="Amount"
                        onChange={async (e) => {
                            setSwapAmount(e.target.value || "");
                            // Calculate the amount of tokens user would receive after the swap
                            await _getAmountOfTokensReceivedFromSwap(e.target.value || "0");
                        }}
                        className={styles.input}
                        value={swapAmount}
                    />
                    <select
                        className={styles.select}
                        name="dropdown"
                        id="dropdown"
                        onChange={async () => {
                            setEthSelected(!ethSelected);
                            // Initialize the values back to zero
                            await _getAmountOfTokensReceivedFromSwap(0);
                            setSwapAmount("");
                        }}
                    >
                        <option value="eth">Ethereum</option>
                        <option value="cryptoDevToken">Crypto Dev Token</option>
                    </select>
                    <br />
                    <div className={styles.inputDiv}>
                        {/* Convert the BigNumber to string using the formatEther function from ethers.js */}
                        {ethSelected
                            ? `You will get ${Number(utils.formatEther(tokenToBeReceivedAfterSwap)).toFixed(2)
                            } Crypto Dev Tokens`
                            : `You will get ${Number(utils.formatEther(tokenToBeReceivedAfterSwap)).toFixed(2)} ETH`}
                    </div>
                    <button className={styles.button1} onClick={_swapTokens}>
                        Swap
                    </button>
                </div>
            );
        }
    };

    const DEX_pagecontent = () => {
        return (
            <>
                <div>
                    <h1 className={styles.title}>Crypto Devs Exchange</h1>
                    <div className={styles.description}>
                        Exchange Ethereum &#60;&#62; Crypto Dev Tokens
                    </div>
                    <div>
                        <button
                            className={styles.button}
                            onClick={() => {
                                setLiquidityTab(true);
                            }}
                        >
                            Liquidity
                        </button>
                        <button
                            className={styles.button}
                            onClick={() => {
                                setLiquidityTab(false);
                            }}
                        >
                            Swap
                        </button>
                    </div>
                    {renderButton_DEX()}
                </div>
            </>
        )
    }
    return (
        <div>{DEX_pagecontent()}</div>
    )
}
