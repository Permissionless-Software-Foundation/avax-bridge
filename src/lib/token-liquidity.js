/*
  Library that contains the business logic specific to this token-liquidity app.
*/

'use strict'

const collect = require('collect.js')
const pRetry = require('p-retry')

const config = require('../../config')

// App utility functions library.
const TLUtils = require('./util')
const tlUtil = new TLUtils()

// BCH library
const BCH = require('./bch')
const bch = new BCH()

// SLP Token library
const SLP = require('./slp')
const slp = new SLP()

// Transactions library
const Transactions = require('./transactions')
const txs = new Transactions()

// const bchLib = require('./send-bch')

// Winston logger
const wlogger = require('../utils/logging')

// Used for debugging and iterrogating JS objects.
const util = require('util')
util.inspect.defaultOptions = { depth: 5 }

const BCH_ADDR1 = config.BCH_ADDR
// const TOKEN_ID = config.TOKEN_ID
const TOKENS_QTY_ORIGINAL = config.TOKENS_QTY_ORIGINAL
const BCH_QTY_ORIGINAL = config.BCH_QTY_ORIGINAL

// p-retry library
// const pRetry = require('p-retry')

const seenTxs = [] // Track processed TXIDs
let _this

class TokenLiquidity {
  constructor () {
    _this = this
    _this.objProcessTx = {}

    this.slp = slp
    this.bch = bch
    this.txs = txs
    this.tlUtil = tlUtil
  }

  async getObjProcessTx () {
    return _this.objProcessTx
  }

  async setObjProcessTx (obj) {
    _this.objProcessTx = obj
  }

  // seenTxs = array of txs that have already been processed.
  // curTxs = Gets a list of transactions associated with the address.
  // diffTxs = diff seenTxs from curTxs
  // filter out all the txs in diffTx that are 0-conf
  // Add them to the seenTxs array after they've been processed.
  //  - Add them before processing in case something goes wrong with the processing.
  // process these txs
  async detectNewTxs (obj) {
    try {
      const { seenTxs } = obj

      // Get the current list of transactions for the apps address.
      const addrInfo = await this.bch.getBCHBalance(config.BCH_ADDR, false)
      // console.log(`addrInfo: ${JSON.stringify(addrInfo, null, 2)}`)
      const curTxs = collect(addrInfo.txids)
      // console.log(`curTxs: ${JSON.stringify(curTxs, null, 2)}`)

      // Diff the transactions against the list of processed txs.
      const diffTxs = curTxs.diff(seenTxs)
      // console.log(`diffTxs: ${JSON.stringify(diffTxs, null, 2)}`)

      // Exit if there are no new transactions.
      if (diffTxs.items.length === 0) return []

      // Get confirmation info on each transaction.
      const confs = await this.txs.getTxConfirmations(diffTxs.items)
      // console.log(`confs: ${JSON.stringify(confs, null, 2)}`)

      // Filter out any zero conf transactions.
      const newTxs = confs.filter(x => x.confirmations > 0)
      // console.log(`newTxs: ${JSON.stringify(newTxs, null, 2)}`)

      return newTxs
    } catch (err) {
      wlogger.error(`Error in lib/token-liquidity.js/processNewTxs()`)
      throw err
    }
  }

  // Processes a single TX, sends tokens or BCH based on the type of transaction.
  async processTx (inObj) {
    try {
      const { txid, bchBalance, tokenBalance } = inObj

      // Data validation
      if (typeof txid !== 'string') throw new Error(`txid needs to be a string`)

      wlogger.info(`Processing new TXID ${txid}.`)

      const lastTransaction = txid

      // Get the sender's address for this transaction.
      const userAddr = await txs.getUserAddr(lastTransaction)
      wlogger.info(`userAddr: ${util.inspect(userAddr)}`)

      // Exit if the userAddr is the same as the bchAddr for this app.
      // This occurs when the app sends bch or tokens to the user, imediately
      // after processing the users transaction and then broadcasting the trade.
      if (userAddr === config.BCH_ADDR) {
        wlogger.info(
          `userAddr === app address. Exiting compareLastTransaction()`
        )

        // Signal that this was a self-generated transaction.
        inObj.txid = null

        return inObj
      }

      // Process new txid.
      const isTokenTx = await slp.tokenTxInfo(lastTransaction)
      wlogger.debug(`isTokenTx: ${isTokenTx}`)

      let newTokenBalance = tokenBalance
      let newBchBalance = bchBalance

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

        const bchOut = _this.exchangeTokensForBCH(exchangeObj)
        wlogger.info(
          `Ready to send ${bchOut} BCH in exchange for ${isTokenTx} tokens`
        )

        // Update the balances
        newTokenBalance = tlUtil.round8(exchangeObj.tokenBalance + isTokenTx)
        newBchBalance = tlUtil.round8(bchBalance - bchOut)
        wlogger.info(`New BCH balance: ${newBchBalance}`)
        wlogger.info(`New token balance: ${newTokenBalance}`)

        // Send BCH
        const obj = {
          recvAddr: userAddr,
          satoshisToSend: Math.floor(bchOut * 100000000)
        }
        wlogger.debug(`obj.satoshisToSend: ${obj.satoshisToSend}`)

        // Send BCH to the user.
        const hex = await bch.createBchTx(obj)
        const userBCHTXID = await bch.broadcastBchTx(hex)
        wlogger.info(`BCH sent to user: ${userBCHTXID}`)

        // Send the user's tokens to the apps token address on the 245
        // derivation path.
        const tokenConfig = await slp.createTokenTx(config.SLP_ADDR, isTokenTx)
        const tokenTXID = await slp.broadcastTokenTx(tokenConfig)
        wlogger.info(
          `Newly recieved tokens sent to 245 derivation path: ${tokenTXID}`
        )

        // User sent BCH
      } else {
        // Get the BCH send amount.
        const bchQty = await bch.recievedBch(lastTransaction, BCH_ADDR1)
        wlogger.info(`${bchQty} BCH recieved.`)

        // Exchange BCH for tokens
        const exchangeObj = {
          bchIn: Number(bchQty),
          bchBalance: Number(bchBalance),
          bchOriginalBalance: BCH_QTY_ORIGINAL,
          tokenOriginalBalance: TOKENS_QTY_ORIGINAL
        }
        const retObj = _this.exchangeBCHForTokens(exchangeObj)

        wlogger.info(
          `Ready to send ${
            retObj.tokensOut
          } tokens in exchange for ${bchQty} BCH`
        )

        // Calculate the new balances
        newBchBalance = tlUtil.round8(Number(bchBalance) + exchangeObj.bchIn)
        newTokenBalance = tlUtil.round8(Number(tokenBalance) - retObj.tokensOut)
        wlogger.debug(`retObj: ${util.inspect(retObj)}`)
        wlogger.info(`New BCH balance: ${newBchBalance}`)
        wlogger.info(`New token balance: ${newTokenBalance}`)
        console.log('retObj.tokensOut', retObj.tokensOut)
        // Send Tokens
        const tokenConfig = await slp.createTokenTx(userAddr, retObj.tokensOut)

        await slp.broadcastTokenTx(tokenConfig)
      }

      const retObj = {
        txid,
        bchBalance: tlUtil.round8(newBchBalance),
        tokenBalance: tlUtil.round8(newTokenBalance)
      }

      // Return the newly detected txid.
      return retObj
    } catch (err) {
      wlogger.error(`Error in token-liquidity.js/processTx(${inObj.txid})`)
      throw err
    }
  }

  // This function wraps the tryProcessTx() function with the p-retry library.
  // This will allow it to try multiple times in the event of an error.
  async pRetryProcessTx (obj) {
    try {
      // Update global var with obj
      // This is because the function that executes the p-retry library
      // cannot pass attributes as parameters
      // _this.setObjProcessTx(obj)

      if (!obj) throw new Error('obj is undefined')

      const result = await pRetry(() => _this.processTx(obj), {
        onFailedAttempt: async error => {
          //   failed attempt.
          console.log(' ')
          console.log(
            `Attempt ${error.attemptNumber} failed. There are ${
              error.retriesLeft
            } retries left. Waiting 4 minutes before trying again.`
          )
          console.log(' ')

          await _this.sleep(60000 * 4) // Sleep for 4 minutes
        },
        retries: 5 // Retry 5 times
      })

      // Reset the global object to an empty object.
      // _this.setObjProcessTx({})

      return result
    } catch (error) {
      console.log('Error in token-liquidity.js/pRetryProcessTx(): ', error)
      return error
      // console.log(error)
    }
  }

  sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Calculates the numbers of tokens to send.
  exchangeBCHForTokens (obj) {
    try {
      const {
        bchIn,
        bchBalance,
        bchOriginalBalance,
        tokenOriginalBalance
      } = obj

      const bch1 = bchBalance
      const bch2 = bch1 - bchIn - 0.0000027 // Subtract 270 satoshi tx fee

      const token1 =
        -1 * tokenOriginalBalance * Math.log(bch1 / bchOriginalBalance)
      const token2 =
        -1 * tokenOriginalBalance * Math.log(bch2 / bchOriginalBalance)

      const tokensOut = token2 - token1

      wlogger.debug(
        `bch1: ${bch1}, bch2: ${bch2}, token1: ${token1}, token2: ${token2}, tokensOut: ${tokensOut}`
      )

      wlogger.debug(`${tokensOut} tokens sent in exchange for ${bchIn} BCH`)

      const retObj = {
        tokensOut: Math.abs(tlUtil.round8(tokensOut)),
        bch2,
        token2
      }

      return retObj
    } catch (err) {
      wlogger.error(`Error in token-liquidity.js/exchangeBCHForTokens().`)
      throw err
    }
  }

  // Calculates the amount of BCH to send.
  exchangeTokensForBCH (obj) {
    try {
      wlogger.silly(`Entering exchangeTokensForBCH.`, obj)

      const {
        tokenIn,
        tokenBalance,
        bchOriginalBalance,
        tokenOriginalBalance
      } = obj

      const token1 = tokenBalance - tokenOriginalBalance
      const token2 = token1 + tokenIn

      const bch1 =
        bchOriginalBalance *
        Math.pow(Math.E, (-1 * token1) / tokenOriginalBalance)
      const bch2 =
        bchOriginalBalance *
        Math.pow(Math.E, (-1 * token2) / tokenOriginalBalance)

      const bchOut = bch2 - bch1 - 0.0000027 // Subtract 270 satoshi tx fee

      wlogger.debug(
        `bch1: ${bch1}, bch2: ${bch2}, token1: ${token1}, token2: ${token2}, bchOut: ${bchOut}`
      )

      return Math.abs(tlUtil.round8(bchOut))
    } catch (err) {
      wlogger.error(`Error in token-liquidity.js/exchangeTokensForBCH().`)
      throw err
    }
  }

  // Returns the 'spot price'. The number of tokens that would be recieved if
  // 1 BCH was sent to the liquidity app.
  getSpotPrice (bchBalance, usdPerBCH) {
    try {
      const obj = {
        bchIn: -1.0,
        bchBalance: bchBalance,
        bchOriginalBalance: 25.0,
        tokenOriginalBalance: 5000
      }

      const tokensFor1BCH = this.exchangeBCHForTokens(obj)

      const price = tlUtil.round8(usdPerBCH / tokensFor1BCH.tokensOut)

      return price
    } catch (err) {
      wlogger.error(`Error in token-liquidity.js/getSpotPrice().`)
      throw err
    }
  }

  // Retrieve the current BCH and token balances from the blockchain.
  async getBlockchainBalances () {
    try {
      // Get BCH balance from the blockchain
      const addressInfo = await bch.getBCHBalance(config.BCH_ADDR, false)
      const bchBalance = addressInfo.balance

      wlogger.debug(`Blockchain balance: ${bchBalance} BCH`)

      const tokenBalance = await slp.getTokenBalance()

      return {
        bchBalance,
        tokenBalance
      }
    } catch (err) {
      wlogger.error(`Error in token-liquidity.js/getBlockchainBalances().`)
      throw err
    }
  }
}

module.exports = TokenLiquidity
