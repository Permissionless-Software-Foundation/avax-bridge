/*
  Unit and integration tests for the token-liquidity.js library
*/

'use strict'

const assert = require('chai').assert
const sinon = require('sinon')
const nock = require('nock')

const TokenLiquidity = require('../../src/lib/token-liquidity')

// const bitboxMock = require('bitbox-mock')
// const txMockData = require('./mocks/transactions')

// Used for debugging.
const util = require('util')
util.inspect.defaultOptions = { depth: 1 }

// Determine if this is a Unit or Integration test
// If not specified, default to unit test.
if (!process.env.APP_ENV) process.env.APP_ENV = 'test'
if (!process.env.TEST_ENV) process.env.TEST_ENV = 'unit'
// const REST_URL = `https://trest.bitcoin.com/v2/`

describe('#token-liquidity', () => {
  let sandbox
  let lib

  before(() => {})

  beforeEach(() => {
    lib = new TokenLiquidity()

    // mockedWallet = Object.assign({}, testwallet) // Clone the testwallet
    sandbox = sinon.createSandbox()

    // Activate nock if it's inactive.
    if (!nock.isActive()) nock.activate()
  })

  afterEach(() => {
    // Clean up HTTP mocks.
    nock.cleanAll() // clear interceptor list.
    nock.restore()

    sandbox.restore()
  })

  describe('#exchangeTokensForBCH', () => {
    it('should calculate values in the spreadsheet', () => {
      const exchangeObj = {
        tokenIn: 500,
        tokenBalance: 8500,
        bchOriginalBalance: 25,
        tokenOriginalBalance: 5000
      }

      const result = lib.exchangeTokensForBCH(exchangeObj)
      // console.log(`result: ${result}`)

      assert.isNumber(result)
      assert.equal(result, 1.1814112, `Should match spreadsheet`)
    })
  })

  describe('exchangeBCHForTokens', () => {
    it('should calculate values in the spreadsheet', () => {
      const exchangeObj = {
        bchIn: 1.181410849,
        bchBalance: 12.41463259,
        bchOriginalBalance: 25,
        tokenOriginalBalance: 5000
      }

      const result = lib.exchangeBCHForTokens(exchangeObj)
      // console.log(`result: ${util.inspect(result)}`)

      assert.hasAllKeys(result, ['tokensOut', 'bch2', 'token2'])
      assert.equal(Math.floor(result.tokensOut), 500, `Should match spreadsheet`)
      assert.isNumber(result.bch2)
      assert.isNumber(result.token2)
    })
  })
})
