/*
  Unit and integration tests for slp.js library.
*/

'use strict'

const assert = require('chai').assert
const sinon = require('sinon')
const SLP = require('../../src/utils/slp')

// Used for debugging.
const util = require('util')
util.inspect.defaultOptions = { depth: 1 }

// Mocking-data
const { slpMock } = require('./mocks/slp')

// Determine if this is a Unit or Integration test
// If not specified, default to unit test.
if (!process.env.APP_ENV) process.env.APP_ENV = 'test'
if (!process.env.TEST_ENV) process.env.TEST_ENV = 'unit'

describe('#slp', () => {
  let slp = new SLP({ restURL: 'https://trest.bitcoin.com/v2/' })
  let sandbox

  before(() => {})

  beforeEach(() => {
    // By default, use the mocking library instead of live calls.
    if (process.env.TEST_ENV === 'unit') slp.slpsdk = slpMock

    // mockedWallet = Object.assign({}, testwallet) // Clone the testwallet
    sandbox = sinon.createSandbox()
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('#getTokenBalance', () => {
    it('should get token balance', async () => {
      // const addr = 'simpleledger:qzl6k0wvdd5ky99hewghqdgfj2jhcpqnfqtaqr70rp'
      const addr = 'slptest:qz4qnxcxwvmacgye8wlakhz0835x0w3vtvxu67w0ac'
      console.log(`restURL: ${slp.slpsdk.restURL}`)

      const tokenBalance = await slp.getTokenBalance(addr)
      // console.log(`bchBalance: ${util.inspect(tokenBalance)}`)

      assert.isArray(tokenBalance)
      assert.hasAllKeys(tokenBalance[0], ['tokenId', 'balance', 'decimalCount'])
    })
  })

  describe('#tokenTxInfo', () => {
    it('should get token balance', async () => {
      const txid =
        '61e71554a3dc18158f30d9e8f5c9b6641a789690b32302899f81cbea9fe3bb49'
      console.log(`restURL: ${slp.slpsdk.restURL}`)

      const tokenInfo = await slp.tokenTxInfo(txid)
      console.log(`tokenInfo: ${util.inspect(tokenInfo)}`)

      // assert.isArray(tokenBalance)
      // assert.hasAllKeys(tokenBalance[0], ['tokenId', 'balance', 'decimalCount'])
    })
  })
})
