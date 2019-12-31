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
          bchBalance: Number(bchBalance),
          bchOriginalBalance: BCH_QTY_ORIGINAL,
          tokenOriginalBalance: TOKENS_QTY_ORIGINAL
        }

        const retObj = _this.exchangeTokensForBCH(exchangeObj)
        wlogger.debug(`retObj: `, retObj)

        const bchOut = retObj.bchOut
        wlogger.info(
          `Ready to send ${bchOut} BCH in exchange for ${isTokenTx} tokens`
        )

        // Update the balances
        newTokenBalance = this.tlUtil.round8(exchangeObj.tokenBalance + isTokenTx)
        newBchBalance = this.tlUtil.round8(bchBalance - bchOut)
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
        newBchBalance = this.tlUtil.round8(Number(bchBalance) + exchangeObj.bchIn)
        newTokenBalance = this.tlUtil.round8(Number(tokenBalance) - retObj.tokensOut)
        wlogger.debug(`retObj: ${util.inspect(retObj)}`)
        wlogger.info(`New BCH balance: ${newBchBalance}`)
        wlogger.info(`New token balance: ${newTokenBalance}`)
        console.log('retObj.tokensOut', retObj.tokensOut)

        // Check if transaction includes an OP_RETURN instruction
        // const opReturnData = bch.readOpReturn(txid)

        // If the TX contains a valid OP_RETURN code
        // if(opReturnData.isValid) {
        //
        //   if(opReturnData.type === 'burn') {
        //     // Call a method in the slp library to burn a select amount of tokens
        //     // instead of sending them to a return address.
        //     const hex = await slp.burnTokenTx(newTokenBalance)
        //   }
        //
        // // Normal BCH transaction with no OP_RETURN.
        // } else {
        //   // Send Tokens
        //   const tokenConfig = await slp.createTokenTx(userAddr, retObj.tokensOut)
        //
        //   await slp.broadcastTokenTx(tokenConfig)
        // }

        // Send Tokens
        const tokenConfig = await slp.createTokenTx(userAddr, retObj.tokensOut, 245)

        await slp.broadcastTokenTx(tokenConfig)
      }

      const retObj = {
        txid,
        bchBalance: this.tlUtil.round8(newBchBalance),
        tokenBalance: this.tlUtil.round8(newTokenBalance)
      }

      // Report the type of transaction we just processed.
      // If tokens, report the qty of tokens.
      if (isTokenTx) {
        retObj.type = 'token'
        retObj.tokenQty = isTokenTx
      } else retObj.type = 'bch'

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

          await this.tlUtil.sleep(60000 * 4) // Sleep for 4 minutes
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

  // Calculates the numbers of tokens to send to user, in exchange for the BCH
  // the user sent to the app.
  // This function only uses the BCH to calculate the token output.
  exchangeBCHForTokens (obj) {
    try {
      const {
        bchIn,
        bchBalance,
        bchOriginalBalance,
        tokenOriginalBalance
      } = obj

      if (!bchBalance) throw new Error(`bchBalance must be defined.`)

      const bch1 = bchBalance

      // Subtract 270 satoshi tx fee
      const bch2 = bch1 + bchIn - 0.0000027

      const token1 =
        -1 * tokenOriginalBalance * Math.log(bch1 / bchOriginalBalance)
      const token2 =
        -1 * tokenOriginalBalance * Math.log(bch2 / bchOriginalBalance)

      const tokensOut = this.tlUtil.round8(Math.abs(token2 - token1))

      // wlogger.debug(
      //   `bch1: ${bch1}, bch2: ${bch2}, token1: ${token1}, token2: ${token2}, tokensOut: ${tokensOut}`
      // )
      //
      // wlogger.debug(`${tokensOut} tokens sent in exchange for ${bchIn} BCH`)

      const retObj = {
        tokensOut: Math.abs(this.tlUtil.round8(tokensOut)),
        bch2: this.tlUtil.round8(bch2),
        token2: this.tlUtil.round8(token2)
      }

      return retObj
    } catch (err) {
      wlogger.error(`Error in token-liquidity.js/exchangeBCHForTokens().`)
      throw err
    }
  }

  // Calculates the amount of BCH to send to the user, in exchange for the BCH
  // the user sent to the app.
  // TODO: This function only considers the token balance. It would be nice
  // to refactor this so that it only uses the BCH balance to calculate the token
  // output.
  exchangeTokensForBCH (obj) {
    try {
      wlogger.silly(`Entering exchangeTokensForBCH.`, obj)

      const {
        tokenIn,
        // tokenBalance,
        bchBalance,
        bchOriginalBalance,
        tokenOriginalBalance
      } = obj

      if (!bchBalance) throw new Error(`bchBalance must be defined.`)

      const bch1 = bchBalance

      const token1 =
        -1 * tokenOriginalBalance * Math.log(bchBalance / bchOriginalBalance)

      const token2 = token1 + tokenIn

      const bch2 =
        bchOriginalBalance *
        Math.pow(Math.E, (-1 * token2 / tokenOriginalBalance))

      let bchOut = bch2 - bch1 - 0.0000027 // Subtract 270 satoshi tx fee
      bchOut = Math.abs(tlUtil.round8(bchOut))

      // wlogger.debug(
      //   `bch1: ${bch1}, bch2: ${bch2}, token1: ${token1}, token2: ${token2}, bchOut: ${bchOut}`
      // )

      // return Math.abs(tlUtil.round8(bchOut))

      const retObj = {
        bchOut,
        bch2: this.tlUtil.round8(bch2),
        token2: this.tlUtil.round8(token2)
      }

      return retObj
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
