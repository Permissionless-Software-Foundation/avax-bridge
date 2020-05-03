/*
  Library for working with BCH.
*/

'use strict'

// const rp = require('request-promise')

// Used for debugging and iterrogating JS objects.
const util = require('util')
util.inspect.defaultOptions = { depth: 5 }

const config = require('../../config')

const TLUtils = require('./util')
const tlUtils = new TLUtils()

// Winston logger
const wlogger = require('./wlogger')

// Mainnet by default
let BITBOX = new config.BCHLIB({ restURL: config.MAINNET_REST })

const SATS_PER_BCH = 100000000

// const BITBOXSDK = require('bitbox-sdk').BITBOX
// let BITBOX, REST_URL
// if (config.NETWORK === `testnet`) {
//   REST_URL = 'https://trest.bitcoin.com/v2/'
//   BITBOX = new BITBOXSDK({ restURL: REST_URL })
// } else {
//   REST_URL = 'https://rest.bitcoin.com/v2/'
//   BITBOX = new BITBOXSDK({ restURL: REST_URL })
// }

// let _this

class BCH {
  constructor () {
    // _this = this

    // Determine if this is a testnet wallet or a mainnet wallet.
    if (config.NETWORK === 'testnet') {
      BITBOX = new config.BCHLIB({ restURL: config.TESTNET_REST })
    }

    this.BITBOX = BITBOX

    this.tlUtils = tlUtils
  }

  // Get the balance in BCH of a BCH address.
  // Returns an object containing balance information.
  // The verbose flag determins if the results are written to the console or not.
  async getBCHBalance (addr, verbose) {
    try {
      // const result = await this.BITBOX.Address.details(addr)
      const result = await this.BITBOX.Blockbook.balance(addr)
      // console.log(`result: ${JSON.stringify(result, null, 2)}`)

      // Convert balance to BCH
      result.balance = this.BITBOX.BitcoinCash.toBitcoinCash(
        Number(result.balance)
      )

      if (verbose) {
        const resultToDisplay = result
        resultToDisplay.txids = []
        console.log(resultToDisplay)
      }

      const bchBalance = result

      return bchBalance
    } catch (err) {
      wlogger.error(`Error in bch.js/getBCHBalance(): ${err.message}`, err)
      wlogger.error(`addr: ${addr}`)
      throw err
    }
  }

  // Returns the utxo with the biggest balance from an array of utxos.
  async findBiggestUtxo (utxos) {
    try {
      wlogger.silly('Entering findBiggestUtxo().')

      if (!Array.isArray(utxos)) throw new Error('utxos needs to be an array')

      let largestAmount = 0
      let largestIndex = 0

      for (let i = 0; i < utxos.length; i++) {
        const thisUtxo = utxos[i]

        if (thisUtxo.satoshis > largestAmount) {
          // Verify the UTXO is valid. Skip if not.
          const isValid = await this.BITBOX.Blockchain.getTxOut(
            thisUtxo.txid,
            thisUtxo.vout
          )
          // console.log(`isValid: ${JSON.stringify(isValid, null, 2)}`)

          if (isValid === null) {
            wlogger.info(`Invalid (stale) UTXO found: ${JSON.stringify(thisUtxo, null, 2)}`)
            continue
          }

          largestAmount = thisUtxo.satoshis
          largestIndex = i
        }
      }

      return utxos[largestIndex]
    } catch (err) {
      wlogger.error('Error in bch.js/findBiggestUtxo().')
      throw err
    }
  }

  // Calculates the amount of BCH that was sent to this app from a TX.
  // Returns a floating point number of BCH recieved. 0 if no match found.
  async recievedBch (txid, addr) {
    try {
      wlogger.silly('Entering receivedBch().')
      // console.log(`addr: ${addr}`)
      // console.log(`this.BITBOX.restURL: ${this.BITBOX.restURL}`)

      // const txDetails = await this.BITBOX.Transaction.details(txid)
      const txDetails = await this.BITBOX.Blockbook.tx(txid)
      // console.log(`txDetails: ${JSON.stringify(txDetails, null, 2)}`)

      const vout = txDetails.vout
      // console.log(`vout: ${JSON.stringify(vout, null, 2)}`)

      // Loop through each vout in the TX.
      for (let i = 0; i < vout.length; i++) {
        const thisVout = vout[i]
        // console.log(`thisVout: ${JSON.stringify(thisVout, null, 2)}`);
        const value = Number(thisVout.value)

        // Skip if value is zero.
        if (thisVout.value === 0.0) continue

        // Skip if address array is empty.
        if (thisVout.addresses.length === 0) continue

        // Skip if vout has no addresses field.
        if (thisVout.addresses) {
          const addresses = thisVout.addresses
          // console.log(`addresses: ${JSON.stringify(addresses, null, 2)}`)

          // Note: Assuming addresses[] only has 1 element.
          // Not sure how there can be multiple addresses if the value is not an array.
          let address = addresses[0] // Legacy address
          wlogger.debug('address: ', address)
          address = this.BITBOX.Address.toCashAddress(address)

          if (address === addr) return this.tlUtils.round8(value / SATS_PER_BCH)
        }
      }

      // Address not found. Return zero.
      return 0
    } catch (err) {
      wlogger.error('Error in recievedBch: ', err)
      throw err
    }
  }

  // Generates a hex-encoded transaction for sending BCH. Returns the hex that
  // is ready to broadcast to the BCH network.
  async createBchTx (obj) {
    try {
      wlogger.silly('Starting sendBch()...')

      const RECV_ADDR = obj.recvAddr
      const satoshisToSend = obj.satoshisToSend

      const walletInfo = this.tlUtils.openWallet()

      const addrDetails = await this.getBCHBalance(config.BCH_ADDR, false)
      // wlogger.debug(`addrDetails: ${JSON.stringify(addrDetails, null, 2)}`)

      const balance = addrDetails.balance
      wlogger.verbose(
        `Balance of sending address ${config.BCH_ADDR} is ${balance} BCH.`
      )

      if (balance <= 0.0) {
        console.log('Balance of sending address is zero. Exiting.')
        process.exit(0)
      }

      const SEND_ADDR_LEGACY = BITBOX.Address.toLegacyAddress(config.BCH_ADDR)
      const RECV_ADDR_LEGACY = BITBOX.Address.toLegacyAddress(RECV_ADDR)
      wlogger.debug(`Sender Legacy Address: ${SEND_ADDR_LEGACY}`)
      wlogger.debug(`Receiver Legacy Address: ${RECV_ADDR_LEGACY}`)

      const utxos = await this.BITBOX.Blockbook.utxo(config.BCH_ADDR)
      // console.log(`utxos: ${JSON.stringify(utxos, null, 2)}`)

      const utxo = await this.findBiggestUtxo(utxos)
      wlogger.debug('selected utxo', utxo)

      // Ensure compatiblity between indexers.
      utxo.value = utxo.amount

      // instance of transaction builder
      let transactionBuilder
      if (config.NETWORK === 'testnet') {
        transactionBuilder = new this.BITBOX.TransactionBuilder('testnet')
      } else {
        transactionBuilder = new this.BITBOX.TransactionBuilder()
      }

      // const satoshisToSend = 1000;
      const originalAmount = utxo.satoshis
      const vout = utxo.vout
      const txid = utxo.txid

      // add input with txid and index of vout
      transactionBuilder.addInput(txid, vout)

      // get byte count to calculate fee. paying 1 sat/byte
      const byteCount = this.BITBOX.BitcoinCash.getByteCount(
        { P2PKH: 1 },
        { P2PKH: 2 }
      )
      wlogger.verbose(`byteCount: ${byteCount}`)
      const satoshisPerByte = 1.0
      const txFee = Math.floor(satoshisPerByte * byteCount)
      wlogger.verbose(`txFee: ${txFee}`)

      // amount to send back to the sending address. It's the original amount - 1 sat/byte for tx size
      const remainder = originalAmount - satoshisToSend - txFee
      wlogger.verbose(`remainder: ${remainder}`)

      // Bail out if remainder is negative.
      if (remainder < 0) {
        throw new Error(`UTXO selected is too small. Remainder: ${remainder}`)
      }

      // add output w/ address and amount to send
      transactionBuilder.addOutput(
        this.BITBOX.Address.toLegacyAddress(RECV_ADDR),
        satoshisToSend
      )
      transactionBuilder.addOutput(
        this.BITBOX.Address.toLegacyAddress(config.BCH_ADDR),
        remainder
      )

      // Generate a change address from a Mnemonic of a private key.
      const change = await this.changeAddrFromMnemonic(walletInfo.mnemonic)

      // Generate a keypair from the change address.
      const keyPair = this.BITBOX.HDNode.toKeyPair(change)

      // Sign the transaction with the HD node.
      let redeemScript
      transactionBuilder.sign(
        0,
        keyPair,
        redeemScript,
        transactionBuilder.hashTypes.SIGHASH_ALL,
        originalAmount
      )

      // build tx
      const tx = transactionBuilder.build()
      // output rawhex
      const hex = tx.toHex()

      return hex
      // console.log(`Transaction raw hex: `);
      // console.log(`${hex}`);
    } catch (err) {
      wlogger.error('Error in bch.js/createBchTx().')
      throw err
    }
  }

  // Broadcasts a hex-encoded transaction to the BCH network. Expects output
  // from createBchTx().
  async broadcastBchTx (hex) {
    try {
      // sendRawTransaction to running BCH node
      const broadcast = await this.BITBOX.RawTransactions.sendRawTransaction(
        hex
      )
      wlogger.verbose(`Transaction ID: ${broadcast}`)

      return broadcast
    } catch (err) {
      wlogger.error('Error in broadcastBchTx')

      // Handle messages from the full node.
      if (err.error) throw new Error(err.error)

      throw err
    }
  }

  // Generate a change address from a Mnemonic of a private key.
  async changeAddrFromMnemonic (mnemonic) {
    // root seed buffer
    const rootSeed = await BITBOX.Mnemonic.toSeed(mnemonic)

    // master HDNode
    let masterHDNode
    if (config.NETWORK === 'testnet') {
      masterHDNode = BITBOX.HDNode.fromSeed(rootSeed, 'testnet')
    } else {
      masterHDNode = BITBOX.HDNode.fromSeed(rootSeed)
    }

    // HDNode of BIP44 account
    const account = BITBOX.HDNode.derivePath(masterHDNode, "m/44'/145'/0'")

    // derive the first external change address HDNode which is going to spend utxo
    const change = BITBOX.HDNode.derivePath(account, '0/0')

    return change
  }

  // Consolidate UTXOs in the 145 path if there are more than 10. This is a
  // maintenance function that is called periodically to keep the UTXOs
  // small and organized.
  async consolidateUtxos () {
    // Amount utxos required to start consolidation.
    const minUtxos = 10

    // Instatiate bch-js librarys
    let transactionBuilder
    if (config.NETWORK === 'testnet') {
      transactionBuilder = new this.BITBOX.TransactionBuilder('testnet')
    } else {
      transactionBuilder = new this.BITBOX.TransactionBuilder()
    }

    try {
      const appAddr = config.BCH_ADDR

      // get the UTXO associated with the app address.
      const utxos = await this.BITBOX.Blockbook.utxo(appAddr)

      // If the number of UTXOs are less than the minimum, exit this function.
      if (utxos.length < minUtxos) {
        console.log('Not enough UTXOs to consolidate')
        return
      }

      // UTXOs number more than 10. So kick-off consolidation.
      console.log('Consolidating UTXOs.')

      // Open the wallet controlling the bch
      const walletInfo = this.tlUtils.openWallet()

      // Get mnemonic from wallet info
      const mnemonic = walletInfo.mnemonic

      // root seed buffer
      const rootSeed = await this.BITBOX.Mnemonic.toSeed(mnemonic)

      // master HDNode
      let masterHDNode
      if (config.NETWORK === 'mainnet') {
        masterHDNode = this.BITBOX.HDNode.fromSeed(rootSeed)
      } else masterHDNode = this.BITBOX.HDNode.fromSeed(rootSeed, 'testnet') // Testnet

      // HDNode of BIP44 account
      const account = this.BITBOX.HDNode.derivePath(
        masterHDNode,
        "m/44'/145'/0'"
      )
      const changePath = this.BITBOX.HDNode.derivePath(account, '0/0')

      // Generate an EC key pair for signing the transaction.
      // const keyPair = this.bchjs.HDNode.toKeyPair(changePath)

      // get the cash address
      const cashAddress = this.BITBOX.HDNode.toCashAddress(changePath)
      console.log(`cashAddress: ${JSON.stringify(cashAddress, null, 2)}`)

      // console.log(utxos)
      if (!Array.isArray(utxos)) throw new Error('UTXOs must be an array.')

      if (utxos.length === 0) throw new Error('No UTXOs found.')

      // Add the satoshis quantity of all UTXOs
      let satoshisAmount = 0
      for (let i = 0; i < utxos.length; i++) {
        const utxo = utxos[i]
        satoshisAmount = satoshisAmount + utxo.satoshis
        transactionBuilder.addInput(utxo.txid, utxo.vout)
      }

      if (satoshisAmount < 1) {
        throw new Error('Original amount is zero. No BCH to send.')
      }

      // Get byte count to calculate fee. paying 1 sat/byte
      const byteCount = this.BITBOX.BitcoinCash.getByteCount(
        { P2PKH: utxos.length },
        { P2PKH: 1 }
      )
      const fee = Math.ceil(1.1 * byteCount)

      // amount to send to receiver.
      const sendAmount = satoshisAmount - fee

      // add output  address and amount to send
      transactionBuilder.addOutput(
        this.BITBOX.Address.toLegacyAddress(cashAddress),
        sendAmount
      )

      // Loop through each input and sign
      let redeemScript
      for (let i = 0; i < utxos.length; i++) {
        const utxo = utxos[i]
        const change = await this.changeAddrFromMnemonic(mnemonic)
        const keyPair = this.BITBOX.HDNode.toKeyPair(change)

        transactionBuilder.sign(
          i,
          keyPair,
          redeemScript,
          transactionBuilder.hashTypes.SIGHASH_ALL,
          utxo.satoshis
        )
      }

      // Build transaction
      const tx = transactionBuilder.build()

      // output rawhex
      const hex = tx.toHex()

      // Broadcast trasaction
      const broadcast = await this.broadcastBchTx(hex)
      return broadcast
    } catch (error) {
      wlogger.error('Error in bch.js/consolidateUtxos()')
      throw error
    }
  }

  // Checks BCH transactions to see if they have an OP_RETURN. Returns an object.
  // If no OP_RETURN is present, the isValid property will be false.
  // If OP_RETURN is present, it will attempt to be decoded.
  async readOpReturn (txid) {
    const retObj = {
      isValid: false // Return false by default.
    }

    try {
      // Get the raw transaction data.
      const txData = await this.BITBOX.RawTransactions.getRawTransaction(
        txid,
        true
      )
      // console.log(`txData: ${JSON.stringify(txData, null, 2)}`)

      // Decode the hex into normal text.
      const script = this.BITBOX.Script.toASM(
        Buffer.from(txData.vout[0].scriptPubKey.hex, 'hex')
      ).split(' ')
      // console.log(`script: ${JSON.stringify(script, null, 2)}`)

      // If there is no OP_RETURN present, then
      if (script[0] !== 'OP_RETURN') return retObj

      // Decode the command
      const cmd = Buffer.from(script[2], 'hex').toString('ascii')
      // cmd = cmd.split(' ')
      // console.log(`cmd: ${JSON.stringify(cmd, null, 2)}`)

      // if (cmd[0] === 'BURN') {
      if (cmd.indexOf('BURN') > -1) {
        // let qty = Number(cmd[1])
        // console.log(`qty: ${qty}`)
        // qty = Number(qty)

        retObj.isValid = true
        retObj.type = 'burn'
        // retObj.qty = qty
      }

      return retObj
    } catch (err) {
      wlogger.error('Error in bch.js/readOpReturn(): ', err)
      return retObj
    }
  }
}

module.exports = BCH
