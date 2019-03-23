/*
  This library exports a class of functions for working with SLP tokens. It
  also wraps the SLP-SDK as slp.slpsdk.
*/

'use strict'

const rp = require('request-promise')

// Used for debugging and iterrogating JS objects.
const util = require('util')
util.inspect.defaultOptions = { depth: 5 }

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

const REST_URL = `https://trest.bitcoin.com/v2/`
// const REST_URL = `http://localhost:3000/v2/`

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

  // Retrieves SLP TX details from rest.bitcoin.com
  async txDetails (txid) {
    try {
      wlogger.silly(`Entering slp.txDetails().`)

      const options = {
        method: 'GET',
        uri: `${REST_URL}slp/txDetails/${txid}`,
        // resolveWithFullResponse: true,
        json: true,
        headers: {
          Accept: 'application/json'
        }
      }

      const result = await rp(options)
      return result
    } catch (err) {
      wlogger.error(`Error in slp.js/txDetails()`)
      throw err
    }
  }

  // Returns a number, representing the token quantity if the TX contains a token
  // transfer. Otherwise returns false.
  async tokenTxInfo (txid) {
    try {
      wlogger.silly(`Entering slp.tokenTxInfo().`)

      const result = await this.txDetails(txid)
      // console.log(`result: ${JSON.stringify(result, null, 2)}`)

      // Exit if token transfer is not the PSF token.
      if (result.tokenInfo.tokenIdHex !== config.SLP_TOKEN_ID) {
        return false
      }

      let tokens = result.tokenInfo.sendOutputs[1]
      tokens = tokens / Math.pow(10, 8)
      // console.log(`tokens transfered: ${tokens}`)

      return tokens
    } catch (err) {
      // Dev Note: A non-token tx will trigger this error handler.

      // console.log(`err: ${util.inspect(err)}`)
      return false
    }
  }

  // Opens the wallet file and returns the contents.
  openWallet () {
    try {
      let walletInfo

      if (config.NETWORK === 'testnet') {
        walletInfo = require(`${__dirname}/../../wallet-test.json`)
      } else {
        walletInfo = require(`${__dirname}/../../wallet-main.json`)
      }
      // console.log(`walletInfo in slp: ${JSON.stringify(walletInfo, null, 2)}`)

      return walletInfo
    } catch (err) {
      return {
        error: `wallet file not found`
      }
    }
  }

  async sendToken () {
    // Open the wallet generated with create-wallet.
    let walletInfo
    try {
      walletInfo = require(`${__dirname}/../../wallet.json`)
    } catch (err) {
      // console.log(`err: `, err)
      console.log(
        `Could not open ${__dirname}/../../wallet.json. Generate a wallet with create-wallet first.
        Exiting.`
      )
      process.exit(0)
    }
  }
}

module.exports = SLP
