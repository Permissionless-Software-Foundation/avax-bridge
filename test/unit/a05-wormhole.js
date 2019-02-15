/*
  Unit and integration tests for last-transaction.js library.
*/

'use strict'

const assert = require('chai').assert
// const BITBOXSDK = require('bitbox-sdk/lib/bitbox-sdk').default
const Wormhole = require('../../src/utils/wormhole')

const util = require('util')
util.inspect.defaultOptions = { depth: 1 }

// const lib = require('../../src/utils/last-transaction')
const { bitboxMock } = require('./mocks/bitbox')

// Determine if this is a Unit or Integration test
// If not specified, default to unit test.
if (!process.env.APP_ENV) process.env.APP_ENV = 'test'
if (!process.env.TEST_ENV) process.env.TEST_ENV = 'unit'

describe('#wormhole', () => {
  let wormhole = new Wormhole({ restURL: 'https://trest.bitcoin.com/v1/' })

  before(() => {})

  beforeEach(() => {
    // By default, use the mocking library instead of live calls.
    if (process.env.TEST_ENV === 'unit') wormhole.wormhole = bitboxMock

    // mockedWallet = Object.assign({}, testwallet) // Clone the testwallet
  })

  describe('#getTokenBalance', () => {
    it('should get token balance', async () => {
      const addr = 'bchtest:qq22ys5qz8z4jzkkex7p5jrdd9vh6q06cgrpsx2fu7'

      const tokenBalance = await wormhole.getTokenBalance(addr)
      // console.log(`bchBalance: ${util.inspect(tokenBalance)}`)

      assert.isArray(tokenBalance)
      assert.hasAllKeys(tokenBalance[0], ['propertyid', 'balance', 'reserved'])
    })
  })
})
