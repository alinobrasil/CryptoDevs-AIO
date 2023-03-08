# Crypto Devs All-in-One
This project is a collection of common features used by NFT & Defi Projects:

- Whitelist
    - Let users connect wallet to add themselves to the whitelist. This whitelist can be applied towards things like an NFT presale
- NFT Minter: 
    - Let people connect wallet and click a button to mint (buy) an NFT. 
    - Whitelisted users can access the presale. They can mint before anyone else.
- ICO: 
    - Use dapp to mint (Buy) ERC20 tokens. 
    - Claim a certain amount of the ERC20 tokens for free if you're an NFT holder. 
- DEX:
    - Add liquidity to a Uniswapv2 style AMM. Enable trading between ETH and the ERC20 token minted.
    - Use dapp interface to swap between ETH and the ERC20 token. 
- DAO proposals:
    - Create proposal to send treasury funds to a certain address
    - Vote on proposals


### Possible Improvements:
- Let owner be able to add addresses to whitelist, 
- enable/disable whitelist, enable/disable pre-sale for NFTs
- Create a deployer. Let anyone deploy a set of contracts that do all these
    - customize things like: 
        - token name
        - NFT details
        - prices of NFT or ERC20 token
        - presale duration
