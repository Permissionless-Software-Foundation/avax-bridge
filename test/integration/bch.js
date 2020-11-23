/*
  Integration tests for the bch.js library.
*/

const assert = require('chai').assert

process.env.NETWORK = 'mainnet'

const BCH = require('../../src/lib/bch')
const bch = new BCH()

describe('#bch.js', () => {
  describe('#getTransactions', () => {
    it('Should return an array of tx data', async () => {
      const bchAddr = 'bitcoincash:qqlktyx5djtd25nkqxmtm229ks4n0eaknsqtq36tgz'
      const result = await bch.getTransactions(bchAddr)
      console.log(`result: ${JSON.stringify(result, null, 2)}`)

      assert.isArray(result)
      assert.property(result[0], 'tx_hash')
      assert.property(result[0], 'height')
    })
  })
})
