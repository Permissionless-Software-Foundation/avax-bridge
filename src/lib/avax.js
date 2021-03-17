/*
  A library for working with AVAX transactions.
*/

const SlpAvaxBridgeLib = require('slp-avax-bridge')

class AvaxLib {
  constructor () {
    this.slpAvaxBridgeLib = new SlpAvaxBridgeLib()
  }
}

module.exports = AvaxLib
