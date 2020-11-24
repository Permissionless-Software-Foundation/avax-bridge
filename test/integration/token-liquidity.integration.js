/*
  Integration tests for the token-liquidity.js library.
*/

process.env.NETWORK = 'mainnet'

const TLLib = require('../../src/lib/token-liquidity')
const tlLib = new TLLib()

const BCH = require('../../src/lib/bch')
const bch = new BCH()

const config = require('../../config')

describe('#token-liquidity.js', () => {
  describe('#detectNewTxs', () => {
    it('should detect a difference in transactions', async () => {
      const historicalTxs = await bch.getTransactions(config.BCH_ADDR)
      const seenTxs = bch.justTxs(historicalTxs)
      // console.log(`seenTxs: ${JSON.stringify(seenTxs, null, 2)}`)

      // Remove a tx from the tx array.
      seenTxs.shift()

      const obj = {
        seenTxs
      }

      const newTxids = await tlLib.detectNewTxs(obj)
      console.log(`newTxids: ${JSON.stringify(newTxids, null, 2)}`)
    })
  })
})
