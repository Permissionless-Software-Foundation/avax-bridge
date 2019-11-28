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
  async getTokenBalance () {
    try {
      wlogger.silly(`Enter slp.getTokenBalance()`)
      // console.log(`addr: ${addr}`)

      const result = await this.bchjs.Util.balancesForAddress(config.SLP_ADDR)
      wlogger.debug(`token balance: `, result)
      // console.log(`result: ${JSON.stringify(result, null, 2)}`)

      if (result === 'No balance for this address' || result.length === 0) {
        return 0
      }

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

  async createTokenTx (addr, qty) {
    try {
      // Open the wallet controlling the tokens
      const walletInfo = tlUtils.openWallet()
      // console.log(`walletInfo: ${JSON.stringify(walletInfo, null, 2)}`)

      const mnemonic = walletInfo.mnemonic
      // // console.log(`mnemonic: ${JSON.stringify(mnemonic, null, 2)}`)

      // root seed buffer
      const rootSeed = await this.bchjs.Mnemonic.toSeed(mnemonic)
      //console.log(`rootSeed: ${JSON.stringify(rootSeed, null, 2)}`)

      // master HDNode
      let masterHDNode
      if (config.NETWORK === `mainnet`) {
        masterHDNode = bchjs.HDNode.fromSeed(rootSeed)
      } else masterHDNode = bchjs.HDNode.fromSeed(rootSeed, 'testnet') // Testnet

      // HDNode of BIP44 account
      const account = this.bchjs.HDNode.derivePath(
        masterHDNode,
        "m/44'/145'/0'"
      )
      // console.log(`account: ${JSON.stringify(account, null, 2)}`)
      const change = this.bchjs.HDNode.derivePath(account, '0/0')
      // console.log(`change: ${JSON.stringify(change, null, 2)}`)

      // Generate an EC key pair for signing the transaction.
      const keyPair = this.bchjs.HDNode.toKeyPair(change)
      // console.log(`keyPair: ${JSON.stringify(keyPair, null, 2)}`)

      // get the cash address
      const cashAddress = 'bchtest:qz4qnxcxwvmacgye8wlakhz0835x0w3vtvaga95c09' // this.bchjs.HDNode.toCashAddress(change)
      const slpAddress = this.bchjs.HDNode.toSLPAddress(change)
      //console.log(`cashAddress to get utxus: ${JSON.stringify(cashAddress, null, 2)}`)
      // console.log(`slpAddress : ${JSON.stringify(slpAddress, null, 2)}`)

      // Get UTXOs held by this address.
      const utxos2 = await this.bchjs.Blockbook.utxo(cashAddress)
      const utxos = utxos2.filter(utxo => utxo.vout > 0)
      // console.log(`utxos: ${JSON.stringify(utxos, null, 2)}`)

      if (utxos.length === 0) throw new Error('No UTXOs to spend! Exiting.')

      // Identify the SLP token UTXOs.
      //  let tokenUtxos = await this.bchjs.SLP.Utils.tokenUtxoDetails(utxos)
      // Get tokens utxos details
      let tokenUtxos = await this.getTokenUtxoDetails(utxos)
      // console.log(`tokenUtxos: ${JSON.stringify(tokenUtxos, null, 2)}`)

      // Filter out the non-SLP token UTXOs.
      const bchUtxos = utxos.filter((utxo, index) => {
        const tokenUtxo = tokenUtxos[index]
        if (!tokenUtxo) return true
      })
      // console.log(`bchUTXOs: ${JSON.stringify(bchUtxos, null, 2)}`)

      if (bchUtxos.length === 0) {
        throw new Error(`Wallet does not have a BCH UTXO to pay miner fees.`)
      }
      // Filter out the token UTXOs that match the user-provided token ID.
      tokenUtxos = tokenUtxos.filter((utxo, index) => {
        if (utxo && utxo.tokenId === config.SLP_TOKEN_ID) return true
      })
      // console.log(`tokenUtxos: ${JSON.stringify(tokenUtxos, null, 2)}`)

      // Choose a UTXO to pay for the transaction.
      const bchUtxo = bch.findBiggestUtxo(bchUtxos)
      // console.log(`bchUtxo: ${JSON.stringify(bchUtxo, null, 2)}`)

      // Add Insight property that is missing from Blockbook.
      bchUtxo.satoshis = Number(bchUtxo.value)

      // Bail out if no token UTXOs are found.
      if (tokenUtxos.length === 0) { throw new Error(`No token UTXOs are available!`) }

      // Generate the OP_RETURN code.
      // console.log(`qty: ${JSON.stringify(qty, null, 2)}`)

      const slpSendObj = this.bchjs.SLP.TokenType1.generateSendOpReturn(
        tokenUtxos,
        qty
      )
      // console.log(`slpSendObj: ${slpSendObj}`)
      // console.log(`slpOutputs: ${slpSendObj.outputs}`)
      const slpData = this.bchjs.Script.encode(slpSendObj.script)
      // console.log(`slpData: ${slpData}`)

      // BEGIN transaction construction.

      // instance of transaction builder
      let transactionBuilder
      if (config.NETWORK === `mainnet`) {
        transactionBuilder = new this.bchjs.TransactionBuilder()
      } else transactionBuilder = new this.bchjs.TransactionBuilder('testnet')

      // Add the BCH UTXO as input to pay for the transaction.
      const originalAmount = bchUtxo.satoshis
      transactionBuilder.addInput(bchUtxo.txid, bchUtxo.vout)

      // add each token UTXO as an input.
      for (let i = 0; i < tokenUtxos.length; i++) {
        transactionBuilder.addInput(tokenUtxos[i].txid, tokenUtxos[i].vout)
      }

      // TODO: Create fee calculator like slpjs
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
        this.bchjs.SLP.Address.toLegacyAddress(addr),
        546
      )

      // Return any token change back to the sender.
      if (slpSendObj.outputs > 1) {
        transactionBuilder.addOutput(
          this.bchjs.SLP.Address.toLegacyAddress(slpAddress),
          546
        )
      }

      // Last output: send the BCH change back to the wallet.
      transactionBuilder.addOutput(
        this.bchjs.Address.toLegacyAddress(cashAddress),
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
      wlogger.error(`Error in createTokenTx: ${err.message}`, err)
      throw err
    }
  }

  // Broadcast the SLP transaction to the BCH network.
  async broadcastTokenTx (hex) {
    try {
      const txidStr = await this.bchjs.RawTransactions.sendRawTransaction([
        hex
      ])
      wlogger.info(`Transaction ID: ${txidStr}`)

      return txidStr
    } catch (err) {
      wlogger.error(`Error in slp.js/broadcastTokenTx()`)
      throw err
    }
  }
  /*
    This function breaks the utxos array in pieces of 20 spaces
    and obtains the tokenUtxoDetails.
    The function tokenUtxoDetails doesn't accept arrays with 20 spaces in size
   */
  async getTokenUtxoDetails (arr) {
    const hunk = 20
    const aux = arr.length / hunk // Number of divisions
    let arrayAux = []
    // For array length < 20
    if (arr.length <= hunk) {
      arrayAux = await this.bchjs.SLP.Utils.tokenUtxoDetails(arr)
      return arrayAux
    }
    // For array length > 20

    for (let i = 0; i < aux - 1; i++) {
      const tokUtxos = await this.bchjs.SLP.Utils.tokenUtxoDetails(arr.slice(i * hunk, hunk + (i * hunk)))
      arrayAux = arrayAux.concat(tokUtxos)
    }

    if (arrayAux.length < arr.length) {
      const tokUtxos = await this.bchjs.SLP.Utils.tokenUtxoDetails(arr.slice(arrayAux.length, arr.length))
      arrayAux = arrayAux.concat(tokUtxos)
    }
    return arrayAux
  }
}

module.exports = SLP
