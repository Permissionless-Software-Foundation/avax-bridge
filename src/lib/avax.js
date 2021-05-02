/*
  A library for working with AVAX transactions.
*/

const axios = require('axios').default
const SlpAvaxBridgeLib = require('slp-avax-bridge')
const bridge = new SlpAvaxBridgeLib()

let _this
class AvaxLib {
  constructor (config) {
    this.config = config
    this.bridge = bridge
    this.axios = axios
    this.limit = 100
    this.avax = bridge.avax
    this.xchain = bridge.avax.avax.XChain()
    _this = this
  }

  async sendTokens (receiverAddress, amount) {
    try {
      // set up the libraries
      const binTools = _this.avax.binTools
      const avm = _this.avax.avm
      _this.xchain.keyChain().importKey(_this.config.AVAX_PRIVATE_KEY)

      // set the required buffers
      const avaxIDBuffer = await _this.xchain.getAVAXAssetID()
      const tokenIDBuffer = binTools.cb58Decode(_this.config.AVAX_TOKEN_ID)
      const addresses = _this.xchain.keyChain().getAddresses()
      const addressStrings = _this.xchain.keyChain().getAddressStrings()

      const receiverBuffer = _this.xchain.parseAddress(receiverAddress)

      if (!addressStrings.length || !addresses.length) {
        throw new Error('No available addresses registered in the keyChain')
      }

      const { utxos: utxoSet } = await _this.xchain.getUTXOs(addressStrings)
      const utxos = utxoSet.getAllUTXOs()

      if (!utxos.length) {
        throw new Error('There are no UTXOs in the address')
      }
      // get the token information
      const balance = utxoSet.getBalance(addresses, avaxIDBuffer)
      const fee = _this.xchain.getDefaultTxFee()

      if (balance.lt(fee)) {
        throw new Error('Not enough founds to pay for transaction')
      }

      const amountToSend = new _this.avax.BN(amount)
      const tokenBalance = utxoSet.getBalance(addresses, tokenIDBuffer)
      // check that the amount to send is not greater than the current amount
      if (tokenBalance.isZero() || tokenBalance.lt(amountToSend)) {
        throw new Error('Token quantity is not enough')
      }

      const remainder = tokenBalance.sub(amountToSend)

      // get the inputs for the transcation
      const inputs = utxos.reduce((txInputs, utxo) => {
        // typeID 7 is a transferable output, all the others gets skipped
        if (utxo.getOutput().getTypeID() !== 7) {
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
        [receiverBuffer]
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
        _this.avax.avax.getNetworkID(),
        binTools.cb58Decode(_this.xchain.getBlockchainID()),
        outputs,
        inputs
      )
      const unsignedTx = new avm.UnsignedTx(baseTx)

      const tx = unsignedTx.sign(_this.xchain.keyChain())
      const txid = await _this.xchain.issueTx(tx)

      console.log(`Tokens send back to the address ${receiverAddress}`)
      console.log(`https://explorer.avax.network/tx/${txid}`)
      return txid
    } catch (err) {
      console.log('Error in avax.js/sendTokens(): ', err)
      throw err
    }
  }

  // Retrieve the most recent transactions for an address from Avascan.
  async getTransactions (addr) {
    try {
      if (typeof addr !== 'string' || !addr.length) {
        throw new Error('The provided avax address is not valid')
      }
      let offset = 0
      const transactions = []
      let res = []
      // Get transaction history for the address.
      do {
        const query = _this.getQuery(addr, offset)
        const request = await _this.axios.post('https://graphql.avascan.info/', { query })

        if (request.status >= 400) {
          throw new Error(`No transaction history could be found for ${addr}`)
        }

        res = request.data.data.transactions.results
        transactions.push(...res)

        offset += _this.limit
      } while (res.length && res.length >= _this.limit)

      return transactions.reverse()
    } catch (err) {
      console.error('Error in avax.js/getTransactions(): ', err)
      throw err
    }
  }

  getQuery (addr, offset) {
    return `{
      transactions(
        address: "${addr}"
        offset: ${offset}
        limit: ${_this.limit}
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
  }

  // check the memo field
  readMemoField (memoBase64) {
    try {
      const returnObj = {
        isValid: false
      }
      const decodedMemo = _this.parseMemoFrom64(memoBase64)
      const [code, bchaddr] = decodedMemo.trim().split(' ')
      const regex = /BCH/ig
      if (!regex.test(code) || !bchaddr) {
        return returnObj
      }
      const legacy = _this.bridge.bch.getValidAddress(bchaddr, '')
      returnObj.isValid = true && Boolean(legacy)
      returnObj.code = code
      returnObj.bchaddr = bchaddr

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
      return decodedMemo.trim()
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
    return _this.xchain.getAssetDescription(_this.config.AVAX_TOKEN_ID)
  }

  // retrieves the current token balance in the given address
  async getTokenBalance (addr, withDecimals = false) {
    try {
      const { balance } = await _this.xchain.getBalance(addr, _this.config.AVAX_TOKEN_ID)

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
