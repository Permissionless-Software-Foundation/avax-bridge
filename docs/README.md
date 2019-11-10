# Developer Documentation
The token-liquidity app is based on [this Koa boilerplate](https://github.com/christroutner/koa-api-boilerplate), which is a web server for building REST APIs in node.js JavaScript. Developers who wish to modify this code base for their own token should familiarize themselves with that boilerplate first. The rest of this document will address the code specific to the token-liquidity app.

To provide context to the mechanics described above, be sure to read the [this section of the PSF business plan](https://psfoundation.cash/biz-plan/business-plan#pseudoStableToken).

## Startup
The app is started by the files in the `/bin` directory.

- `server.js` start the REST API web server.
- `token-liquidity.js` starts the token-liquidity specific part of the app.

There are libraries in the `/src/lib` folder which contain the business logic and utilities for working with the blockchain:

- `bch.js` - library containing utilities for sending and receiving BCH.
- `slp.js` - library containing utilities for sending and receiving SLP tokens.
- `token-liquidity.js` - contains the business logic for the token liquidity app.
- `transactions.js` - library containing utilities for working with BCH transactions.
- `util.js` - a general utilities library.

The app starts by opening its wallet and retrieving its balance of BCH and SLP tokens from the blockchain. It also retrieves a list of previous transactions associated with the wallets address. It stores these previous transactions in the `seenTxs` object.

The BCH balance determines the exchange rate of BCH to tokens, based on the curve described [in the business plan](https://psfoundation.cash/biz-plan/business-plan#pseudoStableToken). It retrieves the current USD market price for BCH and calculates the spot price of the token. This information is then available via the GET `/price` endpoint.

## Running
After startup, the app runs the `processingLoop` which loops every two minutes. It will poll the blockchain to see if it has received any BCH or SLP tokens.

The loop calls `detectNewTxs()` which returns an array of any new TXIDs associated with the apps address. This function will filter out 0-conf transactions, so will only process transactions that have at least 1 confirmation. This greatly reduces the risk of a double spend attack.

If no new transactions are found, the loop retrieves its balances from an indexer and then exits.

If a new transaction is found, it is added to the `seenTxs` object, and then the TX is added to a processing queue. The processing queue will try to process the transaction several times until it succeeds. (*TODO*)

The `token-liquidity.js/processTx()` function processes the transaction. At a high level, the purpose of this function is to send tokens if it recieves BCH, or to send BCH if it recieves tokens. The exchange rate is determined by a mathematical function.
