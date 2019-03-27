/*
  This is the primary utility library for app.js

  This file contians the JavaScript equivalent of private function.
*/

'use strict'

module.exports = {
  compareLastTransaction, // Determine if any new transactions have occured involving this address.
  exchangeBCHForTokens,
  exchangeTokensForBCH,
  saveState,
  readState,
  testableComponents: {
    round8
  }
}

const fs = require('fs')
const util = require('util')
util.inspect.defaultOptions = { depth: 3 }

// Winston logger
const wlogger = require('../utils/logging')

// const lastTransactionLib = require('./last-transaction.js')
const SLP = require('./slp')
const slp = new SLP()

const BCH = require('./bch')
const bch = new BCH()

const Transactions = require('./transactions')
const txs = new Transactions()

const WH = require('./wormhole')
const wh = new WH()

const config = require('../../config')
const BCH_ADDR1 = config.BCH_ADDR
const TOKEN_ID = config.TOKEN_ID
const TOKENS_QTY_ORIGINAL = config.TOKENS_QTY_ORIGINAL
const BCH_QTY_ORIGINAL = config.BCH_QTY_ORIGINAL

const seenTxs = [] // Track processed TXIDs

// Checks the last TX associated with the BCH address. If it changed, then
// the program reacts to it. Otherwise it exits.
// Here is the general flow of this function:
// -Organize the transactions and return an array of 1-conf transactions
// -if there are no 1-conf transactions (2-conf or greater)...
// --Retrieve the BCH and token balances from the blockchain and return those
// -else loop through each transaction in the 1-conf array
// --if the current transaction is different than the last processed transaction...
// ---if the users address matches the app address, ignore and skip.
// ---if the user sent tokens...
// ----calculate and send BCH
// ---if the user sent BCH...
// ----calculate and send tokens
// ---Calculate the new BCH and token balances and return them.
async function compareLastTransaction (obj, bchLib, wormhole) {
  try {
    const { bchAddr, txid, bchBalance, tokenBalance } = obj

    let newBchBalance = bchBalance
    let newTokenBalance = tokenBalance

    // Get an array of 1-conf transactions
    const lastTransactions = await txs.getLastConfirmedTransactions(bchAddr, wormhole)

    // If there are no 0 or 1-conf transactions.
    const isOnly2Conf = await txs.only2Conf(BCH_ADDR1, wormhole)
    if (isOnly2Conf) {
      // Retrieve the balances from the blockchain.
      const retObj2 = await getBlockchainBalances(BCH_ADDR1, wormhole)
      retObj2.lastTransaction = txid
      return retObj2
    }

    // Loop through each 1-conf transaction.
    for (let i = 0; i < lastTransactions.length; i++) {
      const lastTransaction = lastTransactions[i]

      // Check to see if this Tx has already been processed.
      const notSeen = seenTxs.indexOf(lastTransaction) === -1

      // Is this a new, unseen transaction?
      if (lastTransaction !== txid && notSeen) {
        wlogger.info(`New TXID ${lastTransaction} detected.`)

        // Get the sender's address for this transaction.
        const userAddr = await txs.getUserAddr(lastTransaction, wormhole)
        wlogger.info(`userAddr: ${util.inspect(userAddr)}`)

        // Exit if the userAddr is the same as the bchAddr for this app.
        // This occurs when the app sends bch or tokens to the user.
        if (userAddr === bchAddr) {
          wlogger.info(`userAddr === app address. Exiting compareLastTransaction()`)
          seenTxs.push(lastTransaction)
          const retObj = {
            lastTransaction: lastTransaction,
            bchBalance: newBchBalance,
            tokenBalance: newTokenBalance
          }
          return retObj
        }

        // Process new txid.
        // const isTokenTx = await tokenTxInfo(lastTransaction, wormhole)
        const isTokenTx = await slp.tokenTxInfo(lastTransaction)
        wlogger.debug(`isTokenTx: ${isTokenTx}`)

        // User sent tokens.
        if (isTokenTx) {
          wlogger.info(`${isTokenTx} tokens recieved.`)

          // Exchange tokens for BCH
          const exchangeObj = {
            tokenIn: isTokenTx,
            tokenBalance: Number(tokenBalance),
            bchOriginalBalance: BCH_QTY_ORIGINAL,
            tokenOriginalBalance: TOKENS_QTY_ORIGINAL
          }

          const bchOut = exchangeTokensForBCH(exchangeObj)
          wlogger.info(
            `Ready to send ${bchOut} BCH in exchange for ${isTokenTx} tokens`
          )

          // Update the balances
          newTokenBalance = round8(exchangeObj.tokenBalance + isTokenTx)
          newBchBalance = round8(bchBalance - bchOut)
          wlogger.info(`New BCH balance: ${newBchBalance}`)
          wlogger.info(`New token balance: ${newTokenBalance}`)

          // Send BCH
          const obj = {
            recvAddr: userAddr,
            satoshisToSend: Math.floor(bchOut * 100000000)
          }
          wlogger.debug(`obj.satoshisToSend: ${obj.satoshisToSend}`)

          await bchLib.sendBch(obj)

        // User sent BCH
        } else {
          // Get the BCH send amount.
          const bchQty = await bch.recievedBch(lastTransaction, BCH_ADDR1, wormhole)
          wlogger.info(`${bchQty} BCH recieved.`)

          // Exchange BCH for tokens
          const exchangeObj = {
            bchIn: Number(bchQty),
            bchBalance: Number(bchBalance),
            bchOriginalBalance: BCH_QTY_ORIGINAL,
            tokenOriginalBalance: TOKENS_QTY_ORIGINAL
          }
          const retObj = exchangeBCHForTokens(exchangeObj)

          wlogger.info(
            `Ready to send ${retObj.tokensOut} tokens in exchange for ${bchQty} BCH`
          )

          // Calculate the new balances
          // newBchBalance = retObj.bch2
          newBchBalance = round8(Number(bchBalance) + exchangeObj.bchIn)
          newTokenBalance = round8(Number(tokenBalance) - retObj.tokensOut)
          wlogger.debug(`retObj: ${util.inspect(retObj)}`)
          wlogger.info(`New BCH balance: ${newBchBalance}`)
          wlogger.info(`New token balance: ${newTokenBalance}`)

          // Send Tokens
          // const obj = {
          //  recvAddr: userAddr,
          //  tokensToSend: retObj.tokensOut
          // }

          // await tknLib.sendTokens(obj)
          const tokenConfig = await slp.createTokenTx(userAddr, retObj.tokensOut)
          await slp.broadcastTokenTx(tokenConfig)
        }

        // Add the last transaction TXID to the seenTxs array so that it's not
        // processed twice. Allows processing of multiple transactions in the
        // same block.
        seenTxs.push(lastTransaction)

        const retObj = {
          lastTransaction: lastTransaction,
          bchBalance: round8(newBchBalance),
          tokenBalance: round8(newTokenBalance)
        }

        // Return the newly detected txid.
        return retObj
      }
    }

    // Return false to signal no detected change in txid.
    wlogger.debug(`compareLastTransaction returning false.`)
    return false
  } catch (err) {
    wlogger.error(`Error in compareLastTransaction: `, err)
    wlogger.error(`obj: ${JSON.stringify(obj, null, 2)}`)
    throw err
  }
}

// Retrieve the current BCH and token balances from the blockchain.
async function getBlockchainBalances (bchAddr, wormhole) {
  try {
    // Get BCH balance from the blockchain
    const addressInfo = await bch.getBCHBalance(bchAddr, false)
    const currentBCHBalance = addressInfo.balance

    // Get current token balance
    const tokenInfo = await wh.getTokenBalance(bchAddr)
    const thisToken = tokenInfo.find(token => token.propertyid === TOKEN_ID)
    const tokenBalance = thisToken.balance

    wlogger.debug(`Blockchain balance: ${currentBCHBalance} BCH, ${tokenBalance} tokens`)

    return {
      bchBalance: currentBCHBalance,
      tokenBalance: tokenBalance
    }
  } catch (err) {
    wlogger.error(`Error in getBlockchainBalances()`)
    throw err
  }
}

// Calculates the numbers of tokens to send.
function exchangeBCHForTokens (obj) {
  try {
    const { bchIn, bchBalance, bchOriginalBalance, tokenOriginalBalance } = obj

    const bch1 = bchBalance
    const bch2 = bch1 - bchIn - 0.00000270 // Subtract 270 satoshi tx fee

    const token1 = -1 * tokenOriginalBalance * Math.log(bch1 / bchOriginalBalance)
    const token2 = -1 * tokenOriginalBalance * Math.log(bch2 / bchOriginalBalance)

    const tokensOut = token2 - token1

    wlogger.debug(`bch1: ${bch1}, bch2: ${bch2}, token1: ${token1}, token2: ${token2}, tokensOut: ${tokensOut}`)

    wlogger.debug(`${tokensOut} tokens sent in exchange for ${bchIn} BCH`)

    const retObj = {
      tokensOut: Math.abs(round8(tokensOut)),
      bch2,
      token2
    }

    return retObj
  } catch (err) {
    wlogger.error(`Error in util.js/exchangeBCHForTokens() `)
    throw err
  }
}

// Round a number to 8 decimal places, the standard used for Bitcoin.
function round8 (numIn) {
  return Math.floor(numIn * 100000000) / 100000000
}

// Calculates the amount of BCH to send.
function exchangeTokensForBCH (obj) {
  try {
    wlogger.silly(`Entering exchangeTokensForBCH.`, obj)

    const { tokenIn, tokenBalance, bchOriginalBalance, tokenOriginalBalance } = obj

    const token1 = tokenBalance - tokenOriginalBalance
    const token2 = token1 + tokenIn

    const bch1 = bchOriginalBalance * Math.pow(Math.E, -1 * token1 / tokenOriginalBalance)
    const bch2 = bchOriginalBalance * Math.pow(Math.E, -1 * token2 / tokenOriginalBalance)

    const bchOut = bch2 - bch1 - 0.00000270 // Subtract 270 satoshi tx fee

    wlogger.debug(`bch1: ${bch1}, bch2: ${bch2}, token1: ${token1}, token2: ${token2}, bchOut: ${bchOut}`)

    return Math.abs(round8(bchOut))
  } catch (err) {
    wlogger.error(`Error in exchangeTokensForBCH().`)
    throw err
  }
}

function saveState (data) {
  try {
    wlogger.silly(`entering token-util.js saveState().`)

    const filename = `${__dirname}/../../state/state.json`

    return new Promise((resolve, reject) => {
      fs.writeFile(filename, JSON.stringify(data, null, 2), function (err) {
        if (err) {
          wlogger.error(`Error in token-util.js/saveState(): `, err)
          return reject(err)
        }

        wlogger.silly(`Successfully saved to state.json`)

        // console.log(`${name}.json written successfully.`)
        return resolve()
      })
    })
  } catch (err) {
    wlogger.debug(`Error in token-util.js/saveState()`, err)
    throw err
  }
}

// Open and read known-peers.json
function readState (filename) {
  // const filename = '../../peers/known-peers.json'

  try {
    // const filename = `${__dirname}/../../config/state.json`

    // Delete the cached copy of the data.
    delete require.cache[require.resolve(filename)]

    const data = require(filename)
    return data
  } catch (err) {
    wlogger.debug(`Error in token-util.js/saveState()`, err)
    throw new Error(`Could not open ${filename}`)
  }
}
