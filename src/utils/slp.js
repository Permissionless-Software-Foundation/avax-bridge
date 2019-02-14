/*
  This library exports a class of functions for working with SLP tokens. It
  also wraps the SLP-SDK as slp.slpsdk.
*/

'use strict'

let SLPSDK = require('slp-sdk/lib/SLP').default
let slpsdk = new SLPSDK()

class SLP {
  constructor () {
    this.slpsdk = slpsdk
  }

  hello () {
    console.log(`Hello world!`)
  }
}

module.exports = SLP
