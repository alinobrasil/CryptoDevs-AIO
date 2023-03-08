import Head from "next/head";
import styles from "../styles/Home.module.css";
// import Web3Modal from "web3modal";

import BigCard from "../components/BigCard";
import { PageDescriptions } from "../constants/PageDescriptions";

export default function Home() {


    return (
        <div>
            <Head>
                <title > CryptoDevs project</title>
                <meta name="description" content="NFT all-in-one" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <p style={{ padding: "30px" }}>This is a suite of NFT tools for launching an NFT community.</p>
            <div style={{
                margin: "50px",
                marginTop: "0px",
                display: "flex",
                width: "100%",
                flexWrap: "wrap",
            }}>

                <BigCard title={PageDescriptions.whitelist.title}
                    description={PageDescriptions.whitelist.description}
                    image={PageDescriptions.whitelist.image}
                    path="/Whitelist"
                />
                <BigCard title={PageDescriptions.NFT.title}
                    description={PageDescriptions.NFT.description}
                    image={PageDescriptions.NFT.image}
                    path="/NFT"
                />
                <BigCard title={PageDescriptions.ICO.title}
                    description={PageDescriptions.ICO.description}
                    image={PageDescriptions.ICO.image}
                    path="/ICO"
                />
                <BigCard title={PageDescriptions.DAO.title}
                    description={PageDescriptions.DAO.description}
                    image={PageDescriptions.DAO.image}
                    path="/DAO"
                />
                <BigCard title={PageDescriptions.DEX.title}
                    description={PageDescriptions.DEX.description}
                    image={PageDescriptions.DEX.image}
                    path="/DEX"
                />

            </div>

        </div>
    );
}
