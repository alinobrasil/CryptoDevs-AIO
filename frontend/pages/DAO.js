import styles from "../styles/Home.module.css";
import React from 'react'
import { useContext, useEffect, useRef, useState } from "react";
import { BigNumber, Contract, providers, utils } from "ethers";
import { formatEther } from "ethers/lib/utils";
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

export default function DAO() {

    // DAO ------------------------------
    // ETH Balance of the DAO contract
    const [treasuryBalance, setTreasuryBalance] = useState("0");
    // Number of proposals created in the DAO
    const [numProposals, setNumProposals] = useState("0");
    // Array of all proposals created in the DAO
    const [proposals, setProposals] = useState([]);
    // User's balance of CryptoDevs NFTs
    const [nftBalance, setNftBalance] = useState(0);
    // Fake NFT Token ID to purchase. Used when creating a proposal.
    const [fakeNftTokenId, setFakeNftTokenId] = useState("");
    // One of "Create Proposal" or "View Proposals"
    const [selectedTab, setSelectedTab] = useState("");
    const [loadingDAO, setLoadingDAO] = useState(false);


    const context = useContext(AppContext);
    const {
        walletConnected,
        setWalletConnected,
        web3ModalRef,
        getProviderOrSigner,
        connectWallet,
    } = context;

    useEffect(() => {

        if (!walletConnected) {
            connectWallet()
                .then(() => {    //For DAO------
                    getDAOTreasuryBalance();
                    getUserNFTBalance();
                    getNumProposalsInDAO();
                });;  //-------

        }
    }, [walletConnected]);

    // True if waiting for a transaction to be mined, false otherwise.
    // Reads the ETH balance of the DAO contract and sets the `treasuryBalance` state variable
    const getDAOTreasuryBalance = async () => {
        try {
            const provider = await getProviderOrSigner();
            const balance = await provider.getBalance(
                CRYPTODEVS_DAO_CONTRACT_ADDRESS
            );
            setTreasuryBalance(balance.toString());
        } catch (error) {
            console.error(error);
        }
    };

    // Reads the number of proposals in the DAO contract and sets the `numProposals` state variable
    const getNumProposalsInDAO = async () => {
        try {
            const provider = await getProviderOrSigner();
            const contract = getDaoContractInstance(provider);
            const daoNumProposals = await contract.numProposals();
            setNumProposals(daoNumProposals.toString());
        } catch (error) {
            console.error(error);
        }
    };

    // Reads the balance of the user's CryptoDevs NFTs and sets the `nftBalance` state variable
    const getUserNFTBalance = async () => {
        try {
            const signer = await getProviderOrSigner(true);
            const nftContract = getCryptodevsNFTContractInstance(signer);
            const balance = await nftContract.balanceOf(signer.getAddress());
            setNftBalance(parseInt(balance.toString()));
        } catch (error) {
            console.error(error);
        }
    };

    // Calls the `createProposal` function in the contract, using the tokenId from `fakeNftTokenId`
    const createProposal = async () => {
        try {
            const signer = await getProviderOrSigner(true);
            const daoContract = getDaoContractInstance(signer);
            const txn = await daoContract.createProposal(fakeNftTokenId);
            setLoadingDAO(true);
            await txn.wait();
            await getNumProposalsInDAO();
            setLoadingDAO(false);
        } catch (error) {
            console.error(error);
            window.alert(error.data.message);
        }
    };

    // Helper function to fetch and parse one proposal from the DAO contract
    // Given the Proposal ID
    // and converts the returned data into a Javascript object with values we can use
    const fetchProposalById = async (id) => {
        try {
            const provider = await getProviderOrSigner();
            const daoContract = getDaoContractInstance(provider);
            const proposal = await daoContract.proposals(id);
            const parsedProposal = {
                proposalId: id,
                nftTokenId: proposal.nftTokenId.toString(),
                deadline: new Date(parseInt(proposal.deadline.toString()) * 1000),
                yayVotes: proposal.yayVotes.toString(),
                nayVotes: proposal.nayVotes.toString(),
                executed: proposal.executed,
            };
            return parsedProposal;
        } catch (error) {
            console.error(error);
        }
    };

    // Runs a loop `numProposals` times to fetch all proposals in the DAO
    // and sets the `proposals` state variable
    const fetchAllProposals = async () => {
        try {
            const proposals = [];
            for (let i = 0; i < numProposals; i++) {
                const proposal = await fetchProposalById(i);
                proposals.push(proposal);
            }
            setProposals(proposals);
            return proposals;
        } catch (error) {
            console.error(error);
        }
    };

    // Calls the `voteOnProposal` function in the contract, using the passed
    // proposal ID and Vote
    const voteOnProposal = async (proposalId, _vote) => {
        try {
            const signer = await getProviderOrSigner(true);
            const daoContract = getDaoContractInstance(signer);

            let vote = _vote === "YAY" ? 0 : 1;
            const txn = await daoContract.voteOnProposal(proposalId, vote);
            setLoadingDAO(true);
            await txn.wait();
            setLoadingDAO(false);
            await fetchAllProposals();
        } catch (error) {
            console.error(error);
            window.alert(error.data.message);
        }
    };

    // Calls the `executeProposal` function in the contract, using
    // the passed proposal ID
    const executeProposal = async (proposalId) => {
        try {
            const signer = await getProviderOrSigner(true);
            const daoContract = getDaoContractInstance(signer);
            const txn = await daoContract.executeProposal(proposalId);
            setLoadingDAO(true);
            await txn.wait();
            setLoadingDAO(false);
            await fetchAllProposals();
        } catch (error) {
            console.error(error);
            window.alert(error.data.message);
        }
    };

    // Helper function to return a DAO Contract instance
    // given a Provider/Signer
    const getDaoContractInstance = (providerOrSigner) => {
        return new Contract(
            CRYPTODEVS_DAO_CONTRACT_ADDRESS,
            CRYPTODEVS_DAO_ABI,
            providerOrSigner
        );
    };

    // Helper function to return a CryptoDevs NFT Contract instance
    // given a Provider/Signer
    const getCryptodevsNFTContractInstance = (providerOrSigner) => {
        return new Contract(
            CRYPTODEVS_NFT_CONTRACT_ADDRESS,
            CRYPTODEVS_NFT_ABI,
            providerOrSigner
        );
    };

    // Used to re-fetch all proposals in the DAO when user switches
    // to the 'View Proposals' tab
    useEffect(() => {
        if (selectedTab === "View Proposals") {
            fetchAllProposals();
        }
    }, [selectedTab]);

    // Render the contents of the appropriate tab based on `selectedTab`
    function renderTabs() {
        if (selectedTab === "Create Proposal") {
            return renderCreateProposalTab();
        } else if (selectedTab === "View Proposals") {
            return renderViewProposalsTab();
        }
        return null;
    }

    // Renders the 'Create Proposal' tab content
    function renderCreateProposalTab() {
        if (loadingDAO) {
            return (
                <div className={styles.description}>
                    Loading... Waiting for transaction...
                </div>
            );
        } else if (nftBalance === 0) {
            return (
                <div className={styles.description}>
                    You do not own any CryptoDevs NFTs. <br />
                    <b>You cannot create or vote on proposals</b>
                </div>
            );
        } else {
            return (
                <div className={styles.container}>
                    <label>Fake NFT Token ID to Purchase: </label>
                    <input
                        placeholder="0"
                        type="number"
                        onChange={(e) => setFakeNftTokenId(e.target.value)}
                    />
                    <button className={styles.button2} onClick={createProposal}>
                        Create
                    </button>
                </div>
            );
        }
    }

    // Renders the 'View Proposals' tab content
    function renderViewProposalsTab() {
        if (loadingDAO) {
            return (
                <div className={styles.description}>
                    Loading... Waiting for transaction...
                </div>
            );
        } else if (proposals.length === 0) {
            return (
                <div className={styles.description}>No proposals have been created</div>
            );
        } else {
            return (
                <div>
                    {proposals.map((p, index) => (
                        <div key={index} className={styles.proposalCard}>
                            <p>Proposal ID: {p.proposalId}</p>
                            <p>Fake NFT to Purchase: {p.nftTokenId}</p>
                            <p>Deadline: {p.deadline.toLocaleString()}</p>
                            <p>Yay Votes: {p.yayVotes}</p>
                            <p>Nay Votes: {p.nayVotes}</p>
                            <p>Executed?: {p.executed.toString()}</p>
                            {p.deadline.getTime() > Date.now() && !p.executed ? (
                                <div className={styles.flex}>
                                    <button
                                        className={styles.button2}
                                        onClick={() => voteOnProposal(p.proposalId, "YAY")}
                                    >
                                        Vote YAY
                                    </button>
                                    <button
                                        className={styles.button2}
                                        onClick={() => voteOnProposal(p.proposalId, "NAY")}
                                    >
                                        Vote NAY
                                    </button>
                                </div>
                            ) : p.deadline.getTime() < Date.now() && !p.executed ? (
                                <div className={styles.flex}>
                                    <button
                                        className={styles.button2}
                                        onClick={() => executeProposal(p.proposalId)}
                                    >
                                        Execute Proposal{" "}
                                        {p.yayVotes > p.nayVotes ? "(YAY)" : "(NAY)"}
                                    </button>
                                </div>
                            ) : (
                                <div className={styles.description}>Proposal Executed</div>
                            )}
                        </div>
                    ))}
                </div>
            );
        }
    }

    const DAO_pagecontent = () => {
        return (
            <div>
                <h1 className={styles.title}>Crypto Devs DAO</h1>
                <div className={styles.description}>NFT holders get to create & vote on proposals deciding what to do with the DAO's treasury ETH.</div>
                <div className={styles.description}>
                    Your CryptoDevs NFT Balance: {nftBalance}
                    <br />
                    Treasury Balance: {formatEther(treasuryBalance)} ETH
                    <br />
                    Total Number of Proposals: {numProposals}
                </div>
                <div className={styles.flex}>
                    <button
                        className={styles.button}
                        onClick={() => setSelectedTab("Create Proposal")}
                    >
                        Create Proposal
                    </button>
                    <button
                        className={styles.button}
                        onClick={() => setSelectedTab("View Proposals")}
                    >
                        View Proposals
                    </button>
                </div>
                {renderTabs()}
            </div>
        )

    }

    return (
        <div>{DAO_pagecontent()}</div>
    )
}
