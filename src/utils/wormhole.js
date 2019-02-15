/*
  This library exports a class of functions for working with SLP tokens. It
  also wraps the SLP-SDK as slp.slpsdk.
*/

'use strict'

const config = require('../../config')

// Winston logger
const wlogger = require('./logging')

// Used for debugging and iterrogating JS objects.
const util = require('util')
util.inspect.defaultOptions = { depth: 1 }

const WH = require('wormhole-sdk/lib/Wormhole').default
let wormhole
if (config.NETWORK === `testnet`) {
  wormhole = new WH({ restURL: `https://trest.bitcoin.com/v1/` })
} else {
  wormhole = new WH({ restURL: `https://rest.bitcoin.com/v1/` })
}

class Wormhole {
  constructor () {
    this.wormhole = wormhole
  }

  hello () {
    console.log(`Hello world!`)
  }

  // Get the token balance of a BCH address
  async getTokenBalance (addr) {
    try {
      wlogger.silly(`Enter slp.getTokenBalance()`)

      const result = await this.wormhole.DataRetrieval.balancesForAddress(addr)
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
      wlogger.silly(`Entering tokenTxInfo().`)

      const retVal = await this.wormhole.DataRetrieval.transaction(txid)
      wlogger.debug(`tokenTxInfo retVal: ${JSON.stringify(retVal, null, 2)}`)

      if (retVal.message === 'Not a Wormhole Protocol transaction') return false

      return Number(retVal.amount)
    } catch (err) {
      console.log(`err: ${util.inspect(err)}`)
      return false
    }
  }
}

module.exports = Wormhole
