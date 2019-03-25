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
const { wormholeMock } = require('./mocks/wormhole')

// Determine if this is a Unit or Integration test
// If not specified, default to unit test.
if (!process.env.APP_ENV) process.env.APP_ENV = 'test'
if (!process.env.TEST_ENV) process.env.TEST_ENV = 'unit'

describe('#wormhole', () => {
  let wormhole = new Wormhole({ restURL: 'https://trest.bitcoin.com/v1/' })

  before(() => {})

  beforeEach(() => {
    // By default, use the mocking library instead of live calls.
    if (process.env.TEST_ENV === 'unit') wormhole.wormhole = wormholeMock

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

  describe('#tokenTxInfo', () => {
    // See Issue: https://github.com/Bitcoin-com/rest.bitcoin.com/issues/300
    /*
    if (process.env.TEST_ENV !== 'unit') {
      it('should return false for a non-token TX', async () => {
        const txid = 'a77762bb47c130e755cc053db51333bbd64596eefd18baffc08a447749863fa9'

        const result = await wormhole.tokenTxInfo(txid)
        console.log(`result: ${util.inspect(result)}`)

        assert.equal(result, false, 'Expecting false')
      })
    }
    */
    it('should return info on a token TX', async () => {
      const txid = '3b2e9747767cf3d0070ceaffbd60ae40f1cd46f04c8dac3617659073f324f19d'

      const result = await wormhole.tokenTxInfo(txid)
      // console.log(`result: ${util.inspect(result)}`)

      assert.isNumber(result)
      assert.equal(result, 4567)
    })
  })
})
