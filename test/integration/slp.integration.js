/*
  Integration test for testing lib/slp.js methods.
*/

const assert = require('chai').assert

process.env.NETWORK = 'mainnet'

const config = require('../../config')

const SLP = require('../../src/lib/slp')
const slp = new SLP(config)

describe('#slp', () => {
  describe('#createTokenTx', () => {
    it('should generate a TX hex', async () => {
      const addr = 'simpleledger:qq0qr5aqv6whvjrhfygk7s38qmuglf5sm5ufqqaqm5'
      const qty = 1

      const hex = await slp.createTokenTx(addr, qty, 245)

      assert.isString(hex)
    })
  })

  describe('#burnTokenTx', () => {
    it('should generate a TX hex', async () => {
      const hex = await slp.burnTokenTx(1)

      assert.isString(hex)
    })
  })
})
