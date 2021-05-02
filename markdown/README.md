# Documentation

This directory contains documentation for the bridge app. This README contains a high-level overview and links to more low-level information.

## Overview
The first two blockchains targeted by this bridge is the AVAX blockchain with their Avalanche Native Tokens (ANT) on the X-chain, and the Bitcoin Cash (BCH) blockchain with their Simple Ledger Protocol (SLP) tokens. For the sake of documentation, only these two blockchains will be considered. But keep in mind, that this bridge will be expanded in the future for the eCash blockchain and others.

When a token is sent to the app, those tokens are burned on the receiving blockchain, and minted on the other blockchain. The newly minted tokens are then sent on to an address specified by the user. Here is the workflow on each blockchain.

### BCH to AVAX
The workflow for transferring SLP tokens from BCH to AVAX looks like this:

- A SLP transaction for sending tokens to the bridge is generated, but not broadcasted. This is TX1.
- A second transaction is broadcast with an OP_RETURN, as well as a dust output to the bridge. The OP_RETURN contains the TXID of TX1, as well as the AVAX address where the tokens should be sent to. This is TX2.
- TX1 is then broadcast *after* TX2.

The above workflow ensures that no one can 'front run' the transaction. The app reads the information in TX2 and knows where to send the tokens on the AVAX chain when it receives the tokens from TX1.

There is at least one block confirmation before the tokens and transferred across chains. This prevents the risk of double spends.

### AVAX to BCH
The workflow for transferring AVAX tokens (ANTs) to the BCH chain is similar, but can be done with a single transaction and there are no waits for a block confirmation:

- An ANT transaction is broadcasted with the following characteristics:
  - The memo field specifies the address the tokens should be sent to on the BCH chain.
  - The memo follows this format: `bch <BCH addr>`


## Additional Documentation

- [Developer Documentation](./dev-docs.md)
