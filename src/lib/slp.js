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

const TLUtils = require('./util')
const tlUtils = new TLUtils()

// Winston logger
const wlogger = require('../utils/logging')

let SLPSDK = require('slp-sdk')
let slpsdk, REST_URL
if (config.NETWORK === `testnet`) {
  REST_URL = `https://trest.bitcoin.com/v2/`
  slpsdk = new SLPSDK({ restURL: REST_URL })
} else {
  REST_URL = `https://rest.bitcoin.com/v2/`
  slpsdk = new SLPSDK({ restURL: REST_URL })
}

class SLP {
  constructor () {
    this.slpsdk = slpsdk
  }

  hello () {
    console.log(`Hello world!`)
  }

  // Get the token balance of an address.
  async getTokenBalance (addr) {
    try {
      wlogger.silly(`Enter slp.getTokenBalance()`)

      const result = await this.slpsdk.Utils.balancesForAddress(addr)
      wlogger.debug(`token balance: `, result)

      if (result === 'No balance for this address') return 0

      // Get the token information that matches the token-ID for PSF tokens.
      const tokenInfo = result.find(token => token.tokenId === config.SLP_TOKEN_ID)
      // console.log(`tokenInfo: ${JSON.stringify(tokenInfo, null, 2)}`)

      return parseFloat(tokenInfo.balance)
    } catch (err) {
      wlogger.error(`Error in slp.js/getTokenBalance: `, err)
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
      // console.log(`txDetails: ${util.inspect(result)}`)

      return result
    } catch (err) {
      // This catch will activate on non-token txs.
      // wlogger.error(`Error in slp.js/txDetails()`)
      wlogger.debug(`Not a token tx`, err)
      throw err
    }
  }

  // Returns a number, representing the token quantity if the TX contains a token
  // transfer. Otherwise returns false.
  async tokenTxInfo (txid) {
    try {
      wlogger.silly(`Entering slp.tokenTxInfo().`)

      const result = await this.txDetails(txid)
      // console.log(`tokenTxInfo: ${JSON.stringify(result, null, 2)}`)

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

  // Generate TX hex for sending tokens to an address. Returns a config object
  // ready to be broadcast to the BCH network with the SLP SDK TokenType1.send()
  // method.
  createTokenTx (addr, qty) {
    try {
      // Open the wallet controlling the tokens
      const walletInfo = tlUtils.openWallet()

      const mnemonic = walletInfo.mnemonic

      // root seed buffer
      const rootSeed = slpsdk.Mnemonic.toSeed(mnemonic)

      // master HDNode
      let masterHDNode
      if (config.NETWORK === `mainnet`) masterHDNode = slpsdk.HDNode.fromSeed(rootSeed)
      else masterHDNode = slpsdk.HDNode.fromSeed(rootSeed, 'testnet') // Testnet

      // HDNode of BIP44 account
      const account = slpsdk.HDNode.derivePath(masterHDNode, "m/44'/245'/0'")

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

      return sendConfig
    } catch (err) {
      wlogger.error(`Error in slp.js/createTokenTx()`)
      throw err
    }
  }

  // Submit the SLP config object and broadcast the token transaction to the
  // BCH network.
  async broadcastTokenTx (config) {
    try {
      // Generate, sign, and broadcast a hex-encoded transaction for sending
      // the tokens.
      const sendTxId = await slpsdk.TokenType1.send(config)

      wlogger.debug(`sendTxId: ${util.inspect(sendTxId)}`)
      console.log(`sendTxId: ${util.inspect(sendTxId)}`)
    } catch (err) {
      wlogger.error(`Error in slp.js/broadcastTokenTx()`)
      throw err
    }
  }
}

module.exports = SLP
