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
  let slp = new SLP({ restURL: 'https://rest.bitcoin.com/v1/' })
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
      /*
      if (process.env.TEST_ENV === 'unit') {
        sandbox.stub(slp.slpsdk.Utils, "balancesForAddress")
        .resolves(slpMock.)
        slp.slpsdk.Utils.
      }
      */

      const addr = 'simpleledger:qzl6k0wvdd5ky99hewghqdgfj2jhcpqnfqtaqr70rp'

      const tokenBalance = await slp.getTokenBalance(addr)
      // console.log(`bchBalance: ${util.inspect(tokenBalance)}`)

      assert.isArray(tokenBalance)
      assert.hasAllKeys(tokenBalance[0], ['tokenId', 'balance', 'decimalCount'])
    })
  })
})
