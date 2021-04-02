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
          orderBy: { acceptedAt: "asc" }
        ) {
          count
          results {
            ... on XBaseTransaction {
              id
              chainID
              type
              acceptedAt
              memo
              inputs {
                output {
                  id
                  transactionID
                  assetID
                  amount
                  addresses
                  outputType
                }
              }
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
              inputs {
                output {
                  id
                  transactionID
                  assetID
                  amount
                  addresses
                  outputType
                }
              }
              outputs {
                id
                transactionID
                assetID
                outputType
                amount
                addresses
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
      const transactions = request.data.data.transactions.results
      return transactions.reverse()
    } catch (err) {
      console.error('Error in avax.js/getTransactions(): ', err)
      throw err
    }
  }

  // check the memo field
  readMemoField (memoBase64) {
    try {
      const returnObj = {
        isValid: false
      }
      const decodedMemo = _this.parseMemoFrom64(memoBase64)
      const [code, bchaddr] = decodedMemo.split(' ');
      if(!code.includes('BCH') || !Boolean(bchaddr)) {
        return returnObj
      }

      returnObj.isValid = true
      returnObj.code = code
      returnObj.bchaddr = bchaddr;

      return returnObj
    } catch (err) {
      console.log('Error in avax.js/readMemoField()', err)
      throw err
    }
  }

  parseMemoFrom64 (encodedMemo) {
    try {
      if (typeof encodedMemo !== 'string') {
        throw new Error('the encodedMemo must be of type string')
      }

      const decodedMemo = Buffer.from(encodedMemo, 'base64').toString('utf-8')
      return decodedMemo
    } catch (err) {
      console.log('Error in avax.js/parseMemo64()', err)
      throw err
    }
  }

  findValidUTXO (utxos) {
    return utxos.find(utxo => utxo.isValidAsset && utxo.isUserAddress && utxo.outputType === 7)
  }

  // gets the sender address
  // the first input utxo address is set as the sender of the tokens
  getUserAddress (tx) {
    // The first input represents the sender of the tokens.
    const firstInputs = tx.inputs[0]
    const address = firstInputs.addresses[0]
    return address
  }

  // fetches the asset details
  async getAssetDescription () {
    const lib = _this.slpAvaxBridgeLib.avax
    return lib.xchain.getAssetDescription(_this.config.AVAX_TOKEN_ID)
  }

  // retrieves the current token balance in the given address
  async getTokenBalance (addr, withDecimals = false) {
    try {
      const lib = _this.slpAvaxBridgeLib.avax
      const { balance } = await lib.xchain.getBalance(addr, _this.config.AVAX_TOKEN_ID)

      if (!withDecimals) {
        return parseInt(balance)
      }

      const assetDescription = await _this.getAssetDescription()
      const denomination = assetDescription.denomination

      return parseInt(balance) / Math.pow(10, denomination)
    } catch (err) {
      console.error('Error in avax.js/getTransactions(): ', err)
      throw err
    }
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
      memo: tx.memo ?? '',
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
      outputType: utxo.outputType,
      addresses: utxo.addresses,
      amount: parseInt(utxo.amount),
      isValidAsset: utxo.assetID === assetID,
      isUserAddress: isAddress
    }
  }
}

module.exports = AvaxLib
