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

The app starts by opening its wallet and retrieving its balance of BCH and SLP tokens from the blockchain. This determines the exchange rate of BCH to tokens, based on the curve described [in the business plan](https://psfoundation.cash/biz-plan/business-plan#pseudoStableToken). It retrieves the current USD market price for BCH and calculates the spot price of the token. This information is then available via the GET `/price` endpoint.

## Running
After startup, the app runs in a loop every two minutes. It will poll the blockchain to see if it has received any BCH or SLP tokens.

The loop calls the `compareLastTransaction()` function in the `token-liquidity.js` library. It checks the last TX associated with the BCH address. If it changed, then the program reacts to it. Otherwise it exits.

Here is the general flow of this function:
- Organize the transactions and return an array of 1-conf transactions
- if there are no 1-conf transactions (2-conf or greater)...
  - Retrieve the BCH and token balances from the blockchain and return those
- else loop through each transaction in the 1-conf array
  - if the current transaction is different than the last processed transaction...
    - if the users address matches the app address, ignore and skip.
    - if the user sent tokens...
      - calculate and send BCH
    - if the user sent BCH...
      - calculate and send tokens
    - Calculate the new BCH and token balances and return them.


### Experimental changes:

At startup:
- seenTxs = Get a list of transactions associated with the address.


Looping:
- curTxs = Gets a list of transactions associated with the address.
- diffTxs = diff seenTxs from curTxs
- filter out all the txs in diffTx that are 0-conf
- Add them to the seenTxs array after they've been processed.
  - Add them before processing in case something goes wrong with the processing.
- process these txs
