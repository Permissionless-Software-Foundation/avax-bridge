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
