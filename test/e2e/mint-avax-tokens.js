/*
  Generates and broadcasts a BCH transaction which includes an OP_RETURN
  including text data in the transaction.
*/

const WIF = '<Bridge private AVAX key>'
const TOKENID = '2tEi6r6PZ9VXHogUmkCzvijmW81TRNjtKWnR4FA55zTPc87fxC'
const TOKENQTY = 100000
const AVAX_IP = '<Node IP Address>'
const AVAX_PORT = '9650'

const receiverAddress = '<Your AVAX address>'
const avalanche = require('avalanche')
const avm = require('avalanche/dist/apis/avm')

const binTools = avalanche.BinTools.getInstance()

async function mintTokens (num, addr) {
  try {
    // set up the libraries
    const avax = new avalanche.Avalanche(AVAX_IP, parseInt(AVAX_PORT))
    const xchain = avax.XChain()

    xchain.keyChain().importKey(WIF)

    // set the required buffers
    const avaxIDBuffer = await xchain.getAVAXAssetID()

    const addresses = xchain.keyChain().getAddresses()
    const addressStrings = xchain.keyChain().getAddressStrings()
    const receiverBuffer = xchain.parseAddress(addr)

    // encode the memo
    const memo = binTools.stringToBuffer('Script to mint tokens')

    if (!addressStrings.length || !addresses.length) {
      throw new Error('No available addresses registered in the keyChain')
    }

    const { utxos: utxoSet } = await xchain.getUTXOs(addressStrings)

    const utxos = utxoSet.getAllUTXOs()

    if (!utxos.length) {
      throw new Error('There are no UTXOs in the address')
    }

    const balance = utxoSet.getBalance(addresses, avaxIDBuffer)
    const fee = xchain.getCreationTxFee()

    if (balance.lt(fee)) {
      throw new Error('Not enough founds to pay for transaction')
    }

    // Find a utxo with the given assetID for refence
    const tokenUTXO = utxos.find(
      (item) =>
        item.getOutput().getTypeID() === 6 &&
        binTools.cb58Encode(item.getAssetID()) ===
        TOKENID
    )

    if (!tokenUTXO) {
      throw new Error('There are no UTXOs with the given assetID')
    }

    const tokenTxID = tokenUTXO.getTxID()
    const assetID = tokenUTXO.getAssetID()
    // get the utxoID with the minting reference for the output
    const secpMintOutputUTXOIDs = getUTXOIDs(
      utxoSet,
      binTools.cb58Encode(tokenTxID),
      avm.AVMConstants.SECPMINTOUTPUTID,
      binTools.cb58Encode(assetID)
    )

    const mintUTXOID = secpMintOutputUTXOIDs[0]
    const mintUTXO = utxoSet.getUTXO(secpMintOutputUTXOIDs[0])
    const mintOwner = mintUTXO.getOutput()

    // amount to be minted
    const amount = new avalanche.BN(num)
    const transferOutput = new avm.SECPTransferOutput(amount, [receiverBuffer])
    // generate the unsigned transaction
    const unsignedTx = await xchain.buildSECPMintTx(
      utxoSet,
      mintOwner,
      transferOutput,
      addressStrings,
      addressStrings,
      mintUTXOID,
      memo
    )
    // sign the transcation with the private keys stored in the keychain
    const signedTx = unsignedTx.sign(xchain.keyChain())
    const txid = await xchain.issueTx(signedTx)
    console.log('Check transaction status on the block explorer:')
    console.log(`https://explorer.avax.network/tx/${txid}`)
    return txid
  } catch (err) {
    console.log('Error in mintTokens(): ', err)
  }
}

function getUTXOIDs (utxoSet, txid, outputType, assetID) {
  const utxoids = utxoSet.getUTXOIDs()
  return utxoids.reduce((result, id) => {
    if (
      id.includes(txid.slice(0, 10)) &&
      utxoSet.getUTXO(id).getOutput().getOutputID() === outputType &&
      assetID === binTools.cb58Encode(utxoSet.getUTXO(id).getAssetID())
    ) {
      return [...result, id]
    }
    return result
  }, [])
}

mintTokens(TOKENQTY, receiverAddress)
