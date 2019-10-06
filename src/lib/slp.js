/*
  This library exports a class of functions for working with SLP tokens. It
  also wraps the SLP-SDK as slp.slpsdk.
*/

'use strict'

// Used for debugging and iterrogating JS objects.
const util = require('util')
util.inspect.defaultOptions = { depth: 5 }

const config = require('../../config')

const TLUtils = require('./util')
const tlUtils = new TLUtils()

// BCH library
const BCH = require('./bch')
const bch = new BCH()

// Winston logger
const wlogger = require('../utils/logging')

// Mainnet by default
let bchjs = new config.BCHLIB({ restURL: config.MAINNET_REST })

class SLP {
  constructor () {
    // Determine if this is a testnet wallet or a mainnet wallet.
    if (config.NETWORK === 'testnet') {
      bchjs = new config.BCHLIB({ restURL: config.TESTNET_REST })
    }

    this.bchjs = bchjs
  }

  // Get the token balance of an address.
  async getTokenBalance (addr) {
    try {
      wlogger.silly(`Enter slp.getTokenBalance()`)
      // console.log(`addr: ${addr}`)

      const result = await this.bchjs.Util.balancesForAddress(addr)
      wlogger.debug(`token balance: `, result)
      // console.log(`result: ${JSON.stringify(result, null, 2)}`)

      if (result === 'No balance for this address' || result.length === 0) { return 0 }

      // Get the token information that matches the token-ID for PSF tokens.
      let tokenInfo = result.find(
        token => token.tokenId === config.SLP_TOKEN_ID
      )
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

      const txValid = await this.bchjs.Util.validateTxid(txid)
      // console.log(`txValid: ${JSON.stringify(txValid, null, 2)}`)

      // Return false if the tx is not a valid SLP transaction.
      if (!txValid[0].valid) return false

      // const result = await rp(options)
      const result = this.bchjs.Util.txDetails(txid)
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
  async createTokenTx (addr, qty) {
    try {
      // Open the wallet controlling the tokens
      const walletInfo = tlUtils.openWallet()

      const mnemonic = walletInfo.mnemonic

      // root seed buffer
      const rootSeed = await bchjs.Mnemonic.toSeed(mnemonic)

      // master HDNode
      let masterHDNode
      if (config.NETWORK === `mainnet`) { masterHDNode = bchjs.HDNode.fromSeed(rootSeed) } else masterHDNode = bchjs.HDNode.fromSeed(rootSeed, 'testnet') // Testnet

      // HDNode of BIP44 account
      const account = bchjs.HDNode.derivePath(masterHDNode, "m/44'/245'/0'")

      const change = bchjs.HDNode.derivePath(account, '0/0')

      // get the cash address
      const cashAddress = bchjs.HDNode.toCashAddress(change)

      const fundingAddress = bchjs.Address.toSLPAddress(cashAddress)
      const fundingWif = bchjs.HDNode.toWIF(change) // <-- compressed WIF format
      const tokenReceiverAddress = bchjs.Address.toSLPAddress(addr)
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

      wlogger.debug(`sendConfig: ${JSON.stringify(sendConfig, null, 2)}`)

      return sendConfig
    } catch (err) {
      wlogger.error(`Error in slp.js/createTokenTx()`)
      throw err
    }
  }

  async createTokenTx2 (addr, qty) {
    try {
      // Open the wallet controlling the tokens
      const walletInfo = tlUtils.openWallet()

      const mnemonic = walletInfo.mnemonic

      // root seed buffer
      const rootSeed = await bchjs.Mnemonic.toSeed(mnemonic)

      // master HDNode
      let masterHDNode
      if (config.NETWORK === `mainnet`) { masterHDNode = bchjs.HDNode.fromSeed(rootSeed) } else masterHDNode = bchjs.HDNode.fromSeed(rootSeed, 'testnet') // Testnet

      // HDNode of BIP44 account
      const account = bchjs.HDNode.derivePath(masterHDNode, "m/44'/245'/0'")
      const change = bchjs.HDNode.derivePath(account, '0/0')

      // Generate an EC key pair for signing the transaction.
      const keyPair = bchjs.HDNode.toKeyPair(change)

      // get the cash address
      const cashAddress = bchjs.HDNode.toCashAddress(change)
      const slpAddress = bchjs.HDNode.toSLPAddress(change)

      // Get UTXOs held by this address.
      const utxos = await bchjs.Blockbook.utxo(cashAddress)
      console.log(`utxos: ${JSON.stringify(utxos, null, 2)}`)

      if (utxos.length === 0) throw new Error('No UTXOs to spend! Exiting.')

      // Identify the SLP token UTXOs.
      let tokenUtxos = await bchjs.SLP.Utils.tokenUtxoDetails(utxos)
      console.log(`tokenUtxos: ${JSON.stringify(tokenUtxos, null, 2)}`)

      // Filter out the non-SLP token UTXOs.
      const bchUtxos = utxos.filter((utxo, index) => {
        const tokenUtxo = tokenUtxos[index]
        if (!tokenUtxo) return true
      })
      console.log(`bchUTXOs: ${JSON.stringify(bchUtxos, null, 2)}`)

      if (bchUtxos.length === 0) {
        throw new Error(`Wallet does not have a BCH UTXO to pay miner fees.`)
      }

      // Filter out the token UTXOs that match the user-provided token ID.
      tokenUtxos = tokenUtxos.filter((utxo, index) => {
        if (utxo && utxo.tokenId === config.SLP_TOKEN_ID) return true
      })
      console.log(`tokenUtxos: ${JSON.stringify(tokenUtxos, null, 2)}`)

      // Choose a UTXO to pay for the transaction.
      const bchUtxo = bch.findBiggestUtxo(bchUtxos)
      console.log(`bchUtxo: ${JSON.stringify(bchUtxo, null, 2)}`)

      // Generate the OP_RETURN code.
      const slpSendObj = bchjs.SLP.TokenType1.generateSendOpReturn(
        tokenUtxos,
        qty
      )
      const slpData = bchjs.Script.encode(slpSendObj.script)
      console.log(`slpOutputs: ${slpSendObj.outputs}`)

      // BEGIN transaction construction.

      // instance of transaction builder
      let transactionBuilder
      if (config.NETWORK === `mainnet`) {
        transactionBuilder = new bchjs.TransactionBuilder()
      } else transactionBuilder = new bchjs.TransactionBuilder('testnet')

      // Add the BCH UTXO as input to pay for the transaction.
      const originalAmount = bchUtxo.satoshis
      transactionBuilder.addInput(bchUtxo.txid, bchUtxo.vout)

      // add each token UTXO as an input.
      for (let i = 0; i < tokenUtxos.length; i++) {
        transactionBuilder.addInput(tokenUtxos[i].txid, tokenUtxos[i].vout)
      }

      // get byte count to calculate fee. paying 1 sat
      // Note: This may not be totally accurate. Just guessing on the byteCount size.
      // const byteCount = this.BITBOX.BitcoinCash.getByteCount(
      //   { P2PKH: 3 },
      //   { P2PKH: 5 }
      // )
      // //console.log(`byteCount: ${byteCount}`)
      // const satoshisPerByte = 1.1
      // const txFee = Math.floor(satoshisPerByte * byteCount)
      // console.log(`txFee: ${txFee} satoshis\n`)
      const txFee = 250

      // amount to send back to the sending address. It's the original amount - 1 sat/byte for tx size
      const remainder = originalAmount - txFee - 546 * 2
      if (remainder < 1) {
        throw new Error(`Selected UTXO does not have enough satoshis`)
      }
      // console.log(`remainder: ${remainder}`)

      // Add OP_RETURN as first output.
      transactionBuilder.addOutput(slpData, 0)

      // Send dust transaction representing tokens being sent.
      transactionBuilder.addOutput(
        bchjs.SLP.Address.toLegacyAddress(addr),
        546
      )

      // Return any token change back to the sender.
      if (slpSendObj.outputs > 1) {
        transactionBuilder.addOutput(
          bchjs.SLP.Address.toLegacyAddress(slpAddress),
          546
        )
      }

      // Last output: send the BCH change back to the wallet.
      transactionBuilder.addOutput(
        bchjs.Address.toLegacyAddress(cashAddress),
        remainder
      )

      // Sign the transaction with the private key for the BCH UTXO paying the fees.
      let redeemScript
      transactionBuilder.sign(
        0,
        keyPair,
        redeemScript,
        transactionBuilder.hashTypes.SIGHASH_ALL,
        originalAmount
      )

      // Sign each token UTXO being consumed.
      for (let i = 0; i < tokenUtxos.length; i++) {
        const thisUtxo = tokenUtxos[i]

        transactionBuilder.sign(
          1 + i,
          keyPair,
          redeemScript,
          transactionBuilder.hashTypes.SIGHASH_ALL,
          thisUtxo.satoshis
        )
      }

      // build tx
      const tx = transactionBuilder.build()

      // output rawhex
      const hex = tx.toHex()
      // console.log(`Transaction raw hex: `, hex)

      // END transaction construction.

      return hex
    } catch (err) {
      console.error(`Error in sendToken: `, err)
      console.log(`Error message: ${err.message}`)
    }
  }

  // Broadcast the SLP transaction to the BCH network.
  async broadcastTokenTx2 (hex) {
    try {
      const txidStr = await bchjs.RawTransactions.sendRawTransaction([hex])
      wlogger.info(`Transaction ID: ${txidStr}`)

      return txidStr
    } catch (err) {
      wlogger.error(`Error in slp.js/broadcastTokenTx()`)
      throw err
    }
  }

  // Submit the SLP config object and broadcast the token transaction to the
  // BCH network.
  async broadcastTokenTx (config) {
    try {
      // Generate, sign, and broadcast a hex-encoded transaction for sending
      // the tokens.
      const sendTxId = await bchjs.TokenType1.send(config)

      wlogger.debug(`sendTxId: ${util.inspect(sendTxId)}`)
      console.log(`sendTxId: ${util.inspect(sendTxId)}`)
    } catch (err) {
      wlogger.error(`Error in slp.js/broadcastTokenTx()`)
      throw err
    }
  }
}

module.exports = SLP
