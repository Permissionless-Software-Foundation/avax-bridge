/*
  Library for working with BCH transactions.
*/

'use strict'

// Used for debugging and iterrogating JS objects.
const util = require('util')
util.inspect.defaultOptions = { depth: 5 }

const config = require('../../config')

// Winston logger
const wlogger = require('../utils/logging')

// Mainnet by default
let BITBOX = new config.BCHLIB({ restURL: config.MAINNET_REST })

// let _this

class Transactions {
  constructor () {
    // _this = this

    // Determine if this is a testnet wallet or a mainnet wallet.
    if (config.NETWORK === 'testnet') {
      BITBOX = new config.BCHLIB({ restURL: config.TESTNET_REST })
    }

    this.BITBOX = BITBOX
  }

  // Get the transactions associated with an address
  async getTransactions (addr) {
    try {
      const txdata = await this.BITBOX.Address.transactions(addr)
      // const txdata = await this.BITBOX.Blockbook.balance(addr)
      // console.log(`txdata: ${JSON.stringify(txdata, null, 2)}`)

      return txdata.txids
    } catch (err) {
      wlogger.error(`Error in transactions.js/getTransactions().`)
      throw err
    }
  }

  // Get the number of confirmations for a transaction.
  // Expects the txs array returned by getTransactions.
  // Returns an array of objects, ordered is ascending order.
  // Each object has a txid and confirmation property.
  getTxConfs (txdata) {
    try {
      // Data validation
      if (!Array.isArray(txdata)) throw new Error(`txdata needs to be an array`)

      const retArray = []

      for (let i = 0; i < txdata.length; i++) {
        const thisTx = txdata[i]
        const thisObj = {}

        thisObj.txid = thisTx.txid
        thisObj.confirmations = thisTx.confirmations

        retArray.push(thisObj)
      }

      // Sort the objects by confirmation, in ascending order.
      // (zero conf first, oldest conf last)
      const sortedArray = retArray.sort(function (a, b) {
        return a.confirmations - b.confirmations
      })

      return sortedArray
    } catch (err) {
      wlogger.error(`Error in transactions.js/getTxConfs().`)
      throw err
    }
  }

  // Get a single transaction. The last confirmed transaction. 1-conf or older.
  async getLastConfirmedTransaction (bchAddr) {
    try {
      wlogger.silly(`Entering getLastConfirmedTransaction.`)

      // Get an ordered list of transactions associated with this address.
      let txs = await this.getTransactions(bchAddr)
      txs = this.getTxConfs(txs.txs)

      // filter out 0-conf transactions.
      txs = txs.filter(elem => elem.confirmations > 0)

      // Retrieve the most recent 1-conf (or more) transaction.
      const lastTransaction = txs[0].txid
      wlogger.debug(`lastTransaction: ${JSON.stringify(lastTransaction, null, 2)}`)

      return lastTransaction
    } catch (err) {
      wlogger.error(`Error in transactions.js/getLastConfirmedTransaction().`)
      throw err
    }
  }

  // Returns an array of 1-conf transactions associated with the bch address.
  async getLastConfirmedTransactions (bchAddr) {
    try {
      wlogger.silly(`Entering getLastConfirmedTransactions.`)

      // Get an ordered list of transactions associated with this address.
      let txs = await this.getTransactions(bchAddr)
      txs = this.getTxConfs(txs.txs)

      // filter out 0-conf transactions.
      txs = txs.filter(elem => elem.confirmations === 1)

      const lastTxids = []
      for (let i = 0; i < txs.length; i++) {
        const thisTx = txs[i]
        lastTxids.push(thisTx.txid)
      }

      return lastTxids
    } catch (err) {
      wlogger.error(`Error in transactions.js/getLastConfirmedTransactions()`)
      throw err
    }
  }

  // Queries the transaction details and returns the senders BCH address.
  async getUserAddr (txid) {
    try {
      wlogger.debug(`Entering getUserAddr(). txid: ${txid}`)

      // const txDetails = await this.BITBOX.Transaction.details(txid)
      const txDetails = await this.BITBOX.Blockbook.tx(txid)
      // console.log(`txDetails: ${JSON.stringify(txDetails, null, 2)}`)

      // Assumption: There is only 1 vin element, or the senders address exists in
      // the first vin element.
      const vin = txDetails.vin[0]
      // console.log(`vin: ${JSON.stringify(vin, null, 2)}`)
      const senderAddr = vin.addresses[0]

      return senderAddr
    } catch (err) {
      wlogger.debug(`Error in transactions.js/getUserAddr().`)
      throw err
    }
  }

  // Returns true if there are no 0 or 1-conf transactions associated with the address.
  async only2Conf (bchAddr) {
    try {
      wlogger.silly(`Entering only2Conf.`)

      // Get an ordered list of transactions associated with this address.
      let txs = await this.getTransactions(bchAddr)
      txs = this.getTxConfs(txs.txs)

      if (txs[0].confirmations > 1) return true

      return false
    } catch (err) {
      wlogger.error(`Error in transactions.js/only2Conf(). Returning false`, err)
      return false
    }
  }

  // Expects an array of txids as input. Returns an array of objects.
  // Each object contains the txid and the confirmations for that tx.
  async getTxConfirmations (txids) {
    try {
      // Data validation
      if (!Array.isArray(txids)) throw new Error(`txids needs to be an array`)

      // Collect the confirmations for each txid.
      const data = []
      for (let i = 0; i < txids.length; i++) {
        const txid = txids[i]

        // Get the transaction data from the full node.
        const txInfo = await this.BITBOX.RawTransactions.getRawTransaction(txid, true)
        // console.log(`txInfo: ${JSON.stringify(txInfo, null, 2)}`)

        // Get the confirmations for the transactions.
        let confirmations = txInfo.confirmations
        if (confirmations === undefined) confirmations = 0

        data.push({ txid, confirmations })
      }

      return data
    } catch (err) {
      wlogger.error(`Error in transactions.js/getTxConfirmations()`)
      throw err
    }
  }
}

module.exports = Transactions
