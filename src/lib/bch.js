/*
  Library for working with BCH.
*/

'use strict'

const rp = require('request-promise')

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

class BCH {
  constructor () {
    _this = this

    this.BITBOX = BITBOX
  }

  // Get the balance in BCH of a BCH address.
  // Returns an object containing balance information.
  // The verbose flag determins if the results are written to the console or not.
  async getBCHBalance (addr, verbose) {
    try {
      const result = await this.BITBOX.Address.details(addr)

      if (verbose) {
        const resultToDisplay = result
        resultToDisplay.transactions = []
        console.log(resultToDisplay)
      }

      const bchBalance = result

      return bchBalance
    } catch (err) {
      wlogger.error(`Error in getBCHBalance: `, err)
      wlogger.error(`addr: ${addr}`)
      throw err
    }
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

module.exports = BCH
