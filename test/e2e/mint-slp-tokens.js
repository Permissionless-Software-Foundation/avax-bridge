/*
  Generates and broadcasts an SLP transaction
  minting new tokens for the given transaction
*/

const WIF = '<Bridge private SLP Key>'
const TOKENID = '69d9575df68d90b435186afc6c6ea3f7e898cb487adbd947dc7a5bb4e3789cbd'
const TOKENQTY = 5

const receiverAddress = '<Your BCH Address>'

const BCHJS = require('@psf/bch-js')
const bchjs = new BCHJS()

async function mintSlp (wif, num, receiverAddress) {
  try {
    if (isNaN(parseFloat(num)) || num <= 0) {
      throw new Error('Token quantity must be a number higher than 0')
    }

    const keyPair = bchjs.ECPair.fromWIF(wif)
    const cashAddress = bchjs.ECPair.toCashAddress(keyPair)

    // Get the UTXOs associated with the cash address.
    const data = await bchjs.Electrumx.utxo(cashAddress)
    const utxos = data.utxos

    const legacyAddress = bchjs.ECPair.toLegacyAddress(keyPair)

    const receiver = bchjs.Address.toLegacyAddress(receiverAddress)

    if (!utxos.length) {
      throw new Error('No UTXOs available :(\nExiting.')
    }
    let tokenUtxos = await bchjs.SLP.Utils.tokenUtxoDetails(utxos)

    const bchUtxos = utxos.filter(
      (utxo, index) => !tokenUtxos[index].isValid && !utxo.tokenID
    )

    if (!bchUtxos.length) {
      throw new Error('Wallet does not have a BCH UTXO to pay miner fees.')
    }

    tokenUtxos = tokenUtxos.filter(
      utxo =>
        utxo && // UTXO is associated with a token.
        utxo.tokenId === TOKENID && // UTXO matches the token ID.
        utxo.utxoType === 'minting-baton' // UTXO is not a minting baton.
    )

    if (!tokenUtxos.length) {
      throw new Error(
        'No token UTXOs for the specified token could be found.'
      )
    }

    const bchUtxo = await findBiggestUtxo(bchUtxos)

    const originalAmount = bchUtxo.value
    const slpData = bchjs.SLP.TokenType1.generateMintOpReturn(
      tokenUtxos,
      num
    )

    const transactionBuilder = new bchjs.TransactionBuilder()
    transactionBuilder.addInput(bchUtxo.tx_hash, bchUtxo.tx_pos)

    for (let i = 0; i < tokenUtxos.length; i++) {
      transactionBuilder.addInput(tokenUtxos[i].tx_hash, tokenUtxos[i].tx_pos)
    }

    const txFee = 250
    const remainder = originalAmount - txFee - 546 * 2
    if (remainder < 1) {
      throw new Error('Selected UTXO does not have enough satoshis')
    }

    // Send the token back to the wallet
    transactionBuilder.addOutput(slpData, 0)
    transactionBuilder.addOutput(receiver, 546)

    // Send dust transaction representing new minting baton.
    transactionBuilder.addOutput(legacyAddress, 546)

    // Last output: send the BCH change back to the wallet.
    transactionBuilder.addOutput(legacyAddress, remainder)

    // Sign the transaction with the private key for the BCH UTXO paying the fees.
    let redeemScript
    transactionBuilder.sign(
      0,
      keyPair,
      redeemScript,
      transactionBuilder.hashTypes.SIGHASH_ALL,
      originalAmount
    )

    for (let i = 0; i < tokenUtxos.length; i++) {
      const thisUtxo = tokenUtxos[i]

      transactionBuilder.sign(
        1 + i,
        keyPair,
        redeemScript,
        transactionBuilder.hashTypes.SIGHASH_ALL,
        thisUtxo.value
      )
    }
    const tx = transactionBuilder.build()
    const hex = tx.toHex()
    const txid = await bchjs.RawTransactions.sendRawTransaction(hex)

    console.log('Check transaction status on the block explorer:')
    console.log(`https://explorer.bitcoin.com/bch/tx/${txid}`)

    return txid
  } catch (err) {
    console.log('Error in mint-slp-tokens.js', err)
    throw err
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

mintSlp(WIF, TOKENQTY, receiverAddress)
