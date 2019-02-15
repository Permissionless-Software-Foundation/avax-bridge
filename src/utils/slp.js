/*
  This library exports a class of functions for working with SLP tokens. It
  also wraps the SLP-SDK as slp.slpsdk.
*/

'use strict'

// Used for debugging and iterrogating JS objects.
const util = require('util')
util.inspect.defaultOptions = { depth: 1 }

const config = require('../../config')

// Winston logger
const wlogger = require('./logging')

let SLPSDK = require('slp-sdk/lib/SLP').default
let slpsdk
if (config.NETWORK === `testnet`) {
  slpsdk = new SLPSDK({ restURL: `https://rest.bitcoin.com/v2/` })
} else {
  slpsdk = new SLPSDK({ restURL: `https://trest.bitcoin.com/v2/` })
}

class SLP {
  constructor () {
    this.slpsdk = slpsdk
  }

  hello () {
    console.log(`Hello world!`)
  }

  // Get the token balance of a BCH address
  async getTokenBalance (addr) {
    try {
      wlogger.silly(`Enter slp.getTokenBalance()`)

      const result = await this.slpsdk.Utils.balancesForAddress(addr)
      wlogger.debug(`token balance: `, result)

      if (result === 'Address not found') return 0
      return result
    } catch (err) {
      wlogger.error(`Error in util.js/getTokenBalance: `, err)
      throw err
    }
  }

  // Returns a number, representing the token quantity if the TX contains a token
  // transfer. Otherwise returns false.
  async tokenTxInfo (txid) {
    try {
      wlogger.silly(`Entering slp.tokenTxInfo().`)

      console.log(`txid: ${txid}`)
      console.log(`restURL: ${this.slpsdk.restURL}`)
      const txDetails = await this.slpsdk.Transaction.details(txid)
      console.log(`txDetails: ${util.inspect(txDetails)}`)

      // const retVal = await this.slpsdk.Utils.balancesForAddress(slpAddress)
      // wlogger.debug(`tokenTxInfo retVal: ${JSON.stringify(retVal, null, 2)}`)

      // if (retVal.message === 'Not a Wormhole Protocol transaction') return false

      // return Number(retVal.amount)
    } catch (err) {
      console.log(`err: ${util.inspect(err)}`)
      return false
    }
  }
}

module.exports = SLP
