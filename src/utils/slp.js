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

  // Send a qty of SLP tokens to an addr
  async sendToken (addr, qty) {
    try {
      // Open the wallet controlling the tokens
      const walletInfo = this.openWallet()

      const mnemonic = walletInfo.mnemonic

      // root seed buffer
      const rootSeed = slpsdk.Mnemonic.toSeed(mnemonic)

      // master HDNode
      let masterHDNode
      if (config.NETWORK === `mainnet`) masterHDNode = slpsdk.HDNode.fromSeed(rootSeed)
      else masterHDNode = slpsdk.HDNode.fromSeed(rootSeed, 'testnet') // Testnet

      // HDNode of BIP44 account
      const account = slpsdk.HDNode.derivePath(masterHDNode, "m/44'/145'/0'")

      const change = slpsdk.HDNode.derivePath(account, '0/0')

      // get the cash address
      const cashAddress = slpsdk.HDNode.toCashAddress(change)

      const fundingAddress = cashAddress
      const fundingWif = slpsdk.HDNode.toWIF(change) // <-- compressed WIF format
      const tokenReceiverAddress = addr
      const bchChangeReceiverAddress = cashAddress

      // Create a config object for minting
      const sendConfig = {
        fundingAddress,
        fundingWif,
        tokenReceiverAddress,
        bchChangeReceiverAddress,
        tokenId: config.SLP_TOKEN_ID,
        amount: qty
      }

      // console.log(`createConfig: ${util.inspect(createConfig)}`)

      // Generate, sign, and broadcast a hex-encoded transaction for sending
      // the tokens.
      const sendTxId = await slpsdk.TokenType1.send(sendConfig)

      wlogger.debug(`sendTxId: ${util.inspect(sendTxId)}`)
      console.log(`sendTxId: ${util.inspect(sendTxId)}`)
    } catch (err) {
      wlogger.error(`Error in slp.js/sendToken()`)
      throw err
    }
  }
}

module.exports = SLP
