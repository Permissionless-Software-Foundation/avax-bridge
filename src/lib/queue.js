/*
  This library contains methods use to set up a queue with auto-retry. This
  allows new transactions to be processed in-series and recover in the face
  of temporary network or infrastructure failure.
*/

'use strict'

let _this

class Queue {
  constructor () {
    this.queue = queue
    this.pRetry = pRetry

    _this = this
  }

  // Function called by p-retry library.
  // Trys to process a transaction.
  async tryProcessTx (obj) {
    try {
      // Get global obj
      // This because the function that executes the p-retry library
      // cannot pass attributes as parameters
      // const obj = await _this.getObjProcessTx()

      console.log(`Trying to process TXID ${obj.txid} with this data:`)
      console.log(`${JSON.stringify(obj, null, 2)}`)

      const result = await _this.processTx(obj)
      return result
      // console.log('result', result)
    } catch (error) {
      // console.log('ERROR from tryProcessTx function', error)
      console.log(`Error in token-liquidity.js/tryProcessTx(): `, error)
      // throw error
      throw new Error(`Error in tryProcessTx. Try again.`)
    }
  }
}

module.exports = Queue
