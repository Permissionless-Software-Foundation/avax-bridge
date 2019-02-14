/*
  This library exports a class of functions for working with SLP tokens. It
  also wraps the SLP-SDK as slp.slpsdk.
*/

'use strict'

const config = require('../../config')

// Winston logger
const wlogger = require('./logging')

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
}

module.exports = Wormhole
