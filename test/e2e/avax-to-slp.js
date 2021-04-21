/*
  Generates and broadcasts an AVAX transaction with tokens
  which includes a valid memo field for the bridge
*/

const WIF = '<Your AVAX private key>'
const TOKENID = '2tEi6r6PZ9VXHogUmkCzvijmW81TRNjtKWnR4FA55zTPc87fxC'
const TOKENQTY = 5
const AVAX_IP = '<Node IP Address>'
const AVAX_PORT = '9650'

const bridgeAddress = 'X-avax150agl543yn0n5z9z20tgmrggs8fc2ckkma4qfv'
const MESSAGE = 'bch <Your BCH Address>'

const avalanche = require('avalanche')
const avm = require('avalanche/dist/apis/avm')

async function sendTokens (msg, wif, amount) {
  try {
    // set up the libraries
    console.log(AVAX_IP, AVAX_PORT)
    const avax = new avalanche.Avalanche(AVAX_IP, parseInt(AVAX_PORT))
    const xchain = avax.XChain()
    const binTools = avalanche.BinTools.getInstance()

    xchain.keyChain().importKey(wif)

    // set the required buffers
    const avaxIDBuffer = await xchain.getAVAXAssetID()
    const tokenIDBuffer = binTools.cb58Decode(TOKENID)
    const addresses = xchain.keyChain().getAddresses()
    const addressStrings = xchain.keyChain().getAddressStrings()
    const bridgeBuffer = xchain.parseAddress(bridgeAddress)

    // encode memo
    const memo = Buffer.from(msg)

    if (!addressStrings.length || !addresses.length) {
      throw new Error('No available addresses registered in the keyChain')
    }

    const { utxos: utxoSet } = await xchain.getUTXOs(addressStrings)
    const utxos = utxoSet.getAllUTXOs()

    if (!utxos.length) {
      throw new Error('There are no UTXOs in the address')
    }
    // get the token information
    const { denomination } = await xchain.getAssetDescription(TOKENID)
    const balance = utxoSet.getBalance(addresses, avaxIDBuffer)
    const fee = xchain.getDefaultTxFee()

    if (balance.lt(fee)) {
      throw new Error('Not enough founds to pay for transaction')
    }

    const num = amount * Math.pow(10, denomination)
    const amountToSend = new avalanche.BN(num)
    const tokenBalance = utxoSet.getBalance(addresses, tokenIDBuffer)
    // check that the amount to send is not greater than the current amount
    if (tokenBalance.isZero() || tokenBalance.lt(amountToSend)) {
      throw new Error('Token quantity is not enough')
    }

    const remainder = tokenBalance.sub(amountToSend)

    // get the inputs for the transcation
    const inputs = utxos.reduce((txInputs, utxo) => {
      // typeID 6 is a minting baton utxo, it gets skipped
      if (utxo.getOutput().getTypeID() === 6) {
        return txInputs
      }

      const amountOutput = utxo.getOutput()
      const amt = amountOutput.getAmount().clone()
      const txid = utxo.getTxID()
      const outputidx = utxo.getOutputIdx()
      const assetID = utxo.getAssetID()

      // get all the AVAX utxos as input
      if (assetID.toString('hex') === avaxIDBuffer.toString('hex')) {
        const transferInput = new avm.SECPTransferInput(amt)
        transferInput.addSignatureIdx(0, addresses[0])
        const input = new avm.TransferableInput(
          txid,
          outputidx,
          avaxIDBuffer,
          transferInput
        )
        txInputs.push(input)
      }

      // get all the TOKEN utxos as input too
      if (assetID.toString('hex') === tokenIDBuffer.toString('hex')) {
        const transferInput = new avm.SECPTransferInput(amt)
        transferInput.addSignatureIdx(0, addresses[0])
        const input = new avm.TransferableInput(
          txid,
          outputidx,
          assetID,
          transferInput
        )
        txInputs.push(input)
      }

      return txInputs
    }, [])

    // get the desired outputs for the transaction
    const outputs = []
    const avaxTransferOutput = new avm.SECPTransferOutput(
      balance.sub(fee),
      addresses
    )
    const avaxTransferableOutput = new avm.TransferableOutput(
      avaxIDBuffer,
      avaxTransferOutput
    )
    // Add the AVAX output = the avax input minus the fee
    outputs.push(avaxTransferableOutput)

    const tokenTransferOutput = new avm.SECPTransferOutput(
      amountToSend,
      [bridgeBuffer]
    )
    const tokenTransferableOutput = new avm.TransferableOutput(
      tokenIDBuffer,
      tokenTransferOutput
    )
    // Add the Token output
    outputs.push(tokenTransferableOutput)

    // add the remainder as output to be sent back to the address
    if (!remainder.isZero()) {
      const remainderTransferOutput = new avm.SECPTransferOutput(
        remainder,
        addresses
      )
      const remainderTransferableOutput = new avm.TransferableOutput(
        tokenIDBuffer,
        remainderTransferOutput
      )
      outputs.push(remainderTransferableOutput)
    }
    // Add the Token output

    // Build the transcation
    const baseTx = new avm.BaseTx(
      avax.getNetworkID(),
      binTools.cb58Decode(xchain.getBlockchainID()),
      outputs,
      inputs,
      memo
    )
    const unsignedTx = new avm.UnsignedTx(baseTx)

    const tx = unsignedTx.sign(xchain.keyChain())
    const txid = await xchain.issueTx(tx)

    console.log('Check transaction status on the block explorer:')
    console.log(`https://explorer.avax.network/tx/${txid}`)
    return txid
  } catch (err) {
    console.log('Error in sendTokens(): ', err)
  }
}

sendTokens(MESSAGE, WIF, TOKENQTY)
