/*
  Generates and broadcasts a BCH transaction for the bridge
    - the first vout contains the slp information
    - the second last vout has the opreturn with the avax address
*/
const WIF = '<Your SLP private key>'
const TOKENID = '69d9575df68d90b435186afc6c6ea3f7e898cb487adbd947dc7a5bb4e3789cbd'
const TOKENQTY = 1

const bridgeAddress = 'bitcoincash:qrmjjjhz0a7dhp46ymw36l9zd0wcfryahq3s4989yj'
const MESSAGE = 'avax <Your AVAX Address>'

const BCHJS = require('@psf/bch-js')
const bchjs = new BCHJS()

async function sendTokens (msg, wif, amount) {
  try {
    // Create an EC Key Pair from the user-supplied WIF.
    const ecPair = bchjs.ECPair.fromWIF(wif)

    // Generate the public address that corresponds to this WIF.
    const cashAddress = bchjs.ECPair.toCashAddress(ecPair)
    console.log(`Publishing "${msg}" from ${cashAddress} to ${bridgeAddress} with ${amount} tokens`)

    // Pick a UTXO controlled by this address.
    const utxoData = await bchjs.Electrumx.utxo(cashAddress)
    const utxos = utxoData.utxos

    const utxoDetails = await bchjs.SLP.Utils.tokenUtxoDetails(utxos)

    // Filter out the non-SLP token UTXOs.
    const bchUtxos = utxoDetails.filter(utxo => Boolean(utxo) && !utxo.isValid)

    if (bchUtxos.length === 0) {
      throw new Error('Wallet does not have a BCH UTXO to pay miner fees.')
    }

    // Filter out the token UTXOs that match the user-provided token ID.
    const tokenUtxos = utxoDetails.filter((utxo) =>
      Boolean(utxo) && // UTXO is associated with a token.
      utxo.tokenId === TOKENID && // UTXO matches the token ID.
      utxo.utxoType === 'token' // UTXO is not a minting baton.
    )

    if (tokenUtxos.length === 0) {
      throw new Error('No token UTXOs for the specified token could be found.')
    }

    const utxo = await findBiggestUtxo(bchUtxos)
    const dustAmount = 546
    const txFee = 500

    // instance of transaction builder for the first tx
    const firstBuilder = new bchjs.TransactionBuilder()
    const originalAmount = Number(utxo.value)
    const vout = utxo.tx_pos
    const txid = utxo.tx_hash
    const remainder = originalAmount - txFee - (dustAmount * 3)

    if (remainder < 1) {
      throw new Error('Selected UTXO does not have enough satoshis')
    }
    console.log(`originalAmount : ${originalAmount}`)
    console.log(`remainder      : ${remainder}`)

    const slpSendObj = bchjs.SLP.TokenType1.generateSendOpReturn(
      tokenUtxos,
      amount
    )
    const slpData = slpSendObj.script

    firstBuilder.addInput(txid, vout)

    for (let i = 0; i < tokenUtxos.length; i++) {
      firstBuilder.addInput(tokenUtxos[i].tx_hash, tokenUtxos[i].tx_pos)
    }

    firstBuilder.addOutput(slpData, 0)
    // Send dust transaction representing tokens being sent.
    firstBuilder.addOutput(
      bchjs.SLP.Address.toLegacyAddress(bridgeAddress),
      dustAmount
    )
    // Return any token change back to the sender.
    if (slpSendObj.outputs > 1) {
      firstBuilder.addOutput(
        bchjs.SLP.Address.toLegacyAddress(cashAddress),
        dustAmount
      )
    }

    // return the remainder
    if (remainder > 1) {
      firstBuilder.addOutput(
        bchjs.SLP.Address.toLegacyAddress(cashAddress),
        remainder
      )
    }

    // Add the last output with the message OP_RETURN
    // Add the OP_RETURN to the transaction.
    const script = [
      bchjs.Script.opcodes.OP_RETURN,
      Buffer.from('6d02', 'hex'), // Makes message comply with the memo.cash protocol.
      Buffer.from(`${msg}`)
    ]

    // Compile the script array into a bitcoin-compliant hex encoded string.
    const data = bchjs.Script.encode(script)

    // Add the OP_RETURN output.
    firstBuilder.addOutput(data, 0)
    firstBuilder.addOutput(
      bchjs.SLP.Address.toLegacyAddress(bridgeAddress),
      dustAmount
    )

    let firstRedeemScript
    firstBuilder.sign(
      0,
      ecPair,
      firstRedeemScript,
      firstBuilder.hashTypes.SIGHASH_ALL,
      originalAmount
    )
    // Sign each token UTXO being consumed.
    for (let i = 0; i < tokenUtxos.length; i++) {
      const thisUtxo = tokenUtxos[i]

      firstBuilder.sign(
        1 + i,
        ecPair,
        firstRedeemScript,
        firstBuilder.hashTypes.SIGHASH_ALL,
        thisUtxo.value
      )
    }

    const rootTx = firstBuilder.build()
    let rootTxid = rootTx.getId()

    // Broadcast transation to the network
    const roothex = rootTx.toHex()
    console.log(`sending transaction with tokens and message... ${rootTxid}\n`)
    rootTxid = await bchjs.RawTransactions.sendRawTransaction(roothex)
    console.log(`Transaction ID: ${rootTxid}`)
    console.log(`https://explorer.bitcoin.com/bch/tx/${rootTxid}`)

    console.log(' ')
    console.log('All transactions have been broadcasted successfully')
  } catch (err) {
    console.log('Error in writeOpReturn(): ', err)
  }
}

// Returns the utxo with the biggest balance from an array of utxos.
async function findBiggestUtxo (utxos) {
  if (!Array.isArray(utxos)) throw new Error('utxos needs to be an array')

  let largestAmount = 0
  let largestIndex = 0

  for (let i = 0; i < utxos.length; i++) {
    const thisUtxo = utxos[i]

    if (thisUtxo.value > largestAmount) {
      // Ask the full node to validate the UTXO. Skip if invalid.
      const isValid = await bchjs.Blockchain.getTxOut(
        thisUtxo.tx_hash,
        thisUtxo.tx_pos
      )
      if (isValid === null) continue

      largestAmount = thisUtxo.value
      largestIndex = i
    }
  }

  return utxos[largestIndex]
}

sendTokens(MESSAGE, WIF, TOKENQTY)
