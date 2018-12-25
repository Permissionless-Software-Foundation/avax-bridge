/*
  Send tokens to a BCH address.
*/

'use strict'

// Instantiate wormholecash
const Wormhole = require('wormhole-sdk/lib/Wormhole').default
// const Wormhole = require("../../wormholecash/src/node/Wormhole");
// const wormhole = new Wormhole({ restURL: `http://localhost:3000/v1/` })
let wormhole = new Wormhole({ restURL: `https://trest.bitcoin.com/v1/` })

const BITBOXCli = require('bitbox-sdk/lib/bitbox-sdk').default
const BITBOX = new BITBOXCli({ restURL: 'https://trest.bitcoin.com/v1/' })

const lib = require('./token-util.js')

module.exports = {
  sendTokens // Send tokens to a BCH address.
}

// Open the wallet generated with create-wallet.
let walletInfo
try {
  walletInfo = require(`../wallet.json`)
} catch (err) {
  console.log(
    `Could not open wallet.json. Generate a wallet with create-wallet first.
    Exiting.`
  )
  process.exit(0)
}

// Change this value to match your token.
const propertyId = 556
// const RECV_ADDR = `bchtest:qq8wqgxq0uu4y6k92pw9f7s6hxzfp9umsvtg39pzqf`;

// Issue new tokens.
async function sendTokens (obj) {
  try {
    console.log(`Starting sendTokens()...`)

    const RECV_ADDR = obj.recvAddr
    const tokensToSend = obj.tokensToSend
    console.log(`tokensToSend: ${tokensToSend}`)

    const mnemonic = walletInfo.mnemonic

    // root seed buffer
    const rootSeed = BITBOX.Mnemonic.toSeed(mnemonic)

    // master HDNode
    const masterHDNode = BITBOX.HDNode.fromSeed(rootSeed, 'testnet')

    // HDNode of BIP44 account
    const account = BITBOX.HDNode.derivePath(masterHDNode, "m/44'/145'/0'")

    const change = BITBOX.HDNode.derivePath(account, '0/0')

    // get the cash address
    // let cashAddress = BITBOX.HDNode.toCashAddress(change);
    const cashAddress = walletInfo.cashAddress

    // Create simple send payload.
    const payload = await wormhole.PayloadCreation.simpleSend(propertyId, tokensToSend.toString())

    // Get a utxo to use for this transaction.
    const u = await BITBOX.Address.utxo([cashAddress])
    const utxo = lib.findBiggestUtxo(u[0])

    // Create a rawTx using the largest utxo in the wallet.
    utxo.value = utxo.amount
    const rawTx = await wormhole.RawTransactions.create([utxo], {})

    // Add the token information as an op-return code to the tx.
    const opReturn = await wormhole.RawTransactions.opReturn(rawTx, payload)

    // Set the destination/recieving address for the tokens, with the actual
    // amount of BCH set to a minimal amount.
    const ref = await wormhole.RawTransactions.reference(opReturn, RECV_ADDR)

    // Generate a change output.
    const changeHex = await wormhole.RawTransactions.change(
      ref, // Raw transaction we're working with.
      [utxo], // Previous utxo
      cashAddress, // Destination address.
      0.000005 // Miner fee.
    )

    const tx = BITBOX.Transaction.fromHex(changeHex)
    const tb = BITBOX.Transaction.fromTransaction(tx)

    // Finalize and sign transaction.
    const keyPair = BITBOX.HDNode.toKeyPair(change)
    let redeemScript
    tb.sign(0, keyPair, redeemScript, 0x01, utxo.satoshis)
    const builtTx = tb.build()
    const txHex = builtTx.toHex()
    // console.log(txHex);

    // sendRawTransaction to running BCH node
    const broadcast = await BITBOX.RawTransactions.sendRawTransaction(txHex)
    console.log(`Transaction ID: ${broadcast}`)

    console.log(`...Ending sendTokens()`)
  } catch (err) {
    console.log(err)
  }
}
