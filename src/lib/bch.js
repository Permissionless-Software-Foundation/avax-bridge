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

  // Returns the utxo with the biggest balance from an array of utxos.
  findBiggestUtxo (utxos) {
    try {
      wlogger.silly(`Entering findBiggestUtxo().`)

      let largestAmount = 0
      let largestIndex = 0

      for (let i = 0; i < utxos.length; i++) {
        const thisUtxo = utxos[i]

        if (thisUtxo.satoshis > largestAmount) {
          largestAmount = thisUtxo.satoshis
          largestIndex = i
        }
      }

      return utxos[largestIndex]
    } catch (err) {
      wlogger.error(`Error in findBiggestUtxo().`)
      throw err
    }
  }

  // Calculates the amount of BCH was sent to this app from a TX.
  // Returns a floating point number of BCH recieved. 0 if no match found.
  async recievedBch (txid, addr) {
    try {
      wlogger.silly(`Entering receivedBch().`)

      const txDetails = await this.BITBOX.Transaction.details(txid)
      // console.log(`txDetails: ${JSON.stringify(txDetails, null, 2)}`)

      const vout = txDetails.vout

      // Loop through each vout in the TX.
      for (let i = 0; i < vout.length; i++) {
        const thisVout = vout[i]
        // console.log(`thisVout: ${JSON.stringify(thisVout, null, 2)}`);
        const value = thisVout.value

        // Skip if value is zero.
        if (Number(thisVout.value) === 0.0) continue

        // Skip if vout has no addresses field.
        if (thisVout.scriptPubKey.addresses) {
          const addresses = thisVout.scriptPubKey.addresses
          // console.log(`addresses: ${JSON.stringify(addresses, null, 2)}`);

          // Note: Assuming addresses[] only has 1 element.
          // Not sure how there can be multiple addresses if the value is not an array.
          let address = addresses[0] // Legacy address
          address = this.BITBOX.Address.toCashAddress(address)

          if (address === addr) return Number(value)
        }
      }

      // Address not found. Return zero.
      return 0
    } catch (err) {
      wlogger.error(`Error in recievedBch: `, err)
      throw err
    }
  }
}

module.exports = BCH
