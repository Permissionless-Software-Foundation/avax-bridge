/*
  A library for working with AVAX transactions.
*/

const axios = require('axios').default
const SlpAvaxBridgeLib = require('slp-avax-bridge')

let _this
class AvaxLib {
  constructor (config) {
    this.config = config
    this.slpAvaxBridgeLib = new SlpAvaxBridgeLib()
    this.axios = axios

    _this = this
  }

  // Retrieve the most recent transactions for an address from Avascan.
  async getTransactions (addr) {
    try {
      if (typeof addr !== 'string' || !addr.length) {
        throw new Error('The provided avax address is not valid')
      }

      const query = `{
        transactions(
          address: "${addr}"
          offset: 0
          orderBy: { acceptedAt: "desc" }
        ) {
          count
          results {
            ... on XBaseTransaction {
              id
              chainID
              type
              acceptedAt
              memo
              outputs {
                id
                transactionID
                assetID
                outputType
                amount
                addresses
              }
            }
            ... on XCreateAssetTransaction {
              id
              chainID
              type
              acceptedAt
              outputs {
                id
                transactionID
                assetID
                outputType
                amount
                addresses
                type
              }
            }
          }
        }
      }`

      // Get transaction history for the address.
      const request = await _this.axios.post('https://graphql.avascan.info/', { query })
      if (request.status >= 400) {
        throw new Error(`No transaction history could be found for ${addr}`)
      }

      return request.data.data.transactions.results
    } catch (err) {
      console.error('Error in avax.js/getTransactions(): ', err)
      throw err
    }
  }

  // gets the sender address
  // the first input utxo address is set as the sender of the tokens
  getUserAddress (tx) {
    // The first input represents the sender of the tokens.
    const firstInputs = tx.inputs[0]
    const address = firstInputs.addresses[0]
    return address
  }

  // retrieves the current token balance in the given address
  async getTokenBalance (addr, withDecimals = false) {
    console.log(`addr: ${addr}`)
    const lib = _this.slpAvaxBridgeLib.avax
    const tokenBuffer = lib.binTools.cb58Decode(_this.config.AVAX_TOKEN_ID)
    const balance = await lib.xchain.getBalance(addr, tokenBuffer)

    if (!withDecimals) {
      return balance.toNumber()
    }

    const assetDescription = await lib.xchain.getAssetDescription(tokenBuffer)
    const denomination = assetDescription.denomination

    return balance.toNumber() / Math.pow(10, denomination)
  }

  // Maps the transaction arrays into an transaction id array
  justTxs (txsArr) {
    return txsArr.map(elem => elem.id)
  }

  // filters out the already seen txs and applies format the unseen txs
  filterNewTx (newTx, historicalTxs) {
    return newTx.map(txid => {
      const item = historicalTxs.find(element => element.id === txid)
      return _this.formatTx(item)
    })
  }

  // sorts the transaction item into a readable one
  formatTx (tx) {
    const inputs = tx.inputs.map(item => _this.formatUTXO(item.output))
    const outputs = tx.outputs.map(utxo => _this.formatUTXO(utxo))

    return {
      id: tx.id,
      memo: tx.memo,
      inputs,
      outputs
    }
  }

  // formats the utxos (inputs, and outputs)
  formatUTXO (utxo, assetID = this.config.AVAX_TOKEN_ID, address = this.config.AVAX_ADDR) {
    const isAddress = utxo.addresses.includes(address)

    return {
      id: utxo.id, // utxo id
      txid: utxo.transactionID,
      assetID: utxo.assetID,
      addresses: utxo.addresses,
      amount: parseInt(utxo.amount),
      isValidAsset: utxo.assetID === assetID,
      isUserAddress: isAddress
    }
  }
}

module.exports = AvaxLib
