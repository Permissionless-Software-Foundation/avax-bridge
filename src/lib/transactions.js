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

const BITBOXCli = require('bitbox-sdk')
let BITBOX, REST_URL
if (config.NETWORK === `testnet`) {
  REST_URL = 'https://trest.bitcoin.com/v1/'
  BITBOX = new BITBOXCli({ restURL: REST_URL })
} else {
  REST_URL = 'https://rest.bitcoin.com/v1/'
  BITBOX = new BITBOXCli({ restURL: REST_URL })
}

let _this

class Transactions {
  constructor () {
    _this = this

    this.BITBOX = BITBOX
  }

  // Get the transactions associated with an address
  async getTransactions (addr) {
    try {
      const txdata = await this.BITBOX.Address.transactions(addr)
      // console.log(`txdata: ${JSON.stringify(txdata, null, 2)}`)

      return txdata
    } catch (err) {
      wlogger.error(`Error in bch.js/getTransactions().`)
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
      throw err
    }
  }
}

module.exports = Transactions
