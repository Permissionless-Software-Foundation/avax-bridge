/*
  Unit and integration tests for bch.js library.
*/

'use strict'

const assert = require('chai').assert
const sinon = require('sinon')
const nock = require('nock')

const Transactions = require('../../src/lib/transactions')

const bitboxMock = require('bitbox-mock')
// const bchMockData = require('./mocks/bch')

// Used for debugging.
const util = require('util')
util.inspect.defaultOptions = { depth: 1 }

// Determine if this is a Unit or Integration test
// If not specified, default to unit test.
if (!process.env.APP_ENV) process.env.APP_ENV = 'test'
if (!process.env.TEST_ENV) process.env.TEST_ENV = 'unit'
// const REST_URL = `https://trest.bitcoin.com/v2/`

describe('#transactions', () => {
  let sandbox
  let txs

  before(() => {})

  beforeEach(() => {
    txs = new Transactions()

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

  describe('#getTransactions', () => {
    it('should get transactions associated with an address', async () => {
      // If unit test, use the mocking library instead of live calls.
      if (process.env.TEST_ENV === 'unit') {
        txs.BITBOX = bitboxMock
      }

      const addr = 'bchtest:qqafk2cvztl8yt70v5akaawucwrn94hl2yups7rzfn'

      const txids = await txs.getTransactions(addr)
      // console.log(`txids: ${util.inspect(txids)}`)

      assert.hasAllKeys(txids, ['pagesTotal', 'txs'])
      assert.isArray(txids.txs)
    })
  })

  describe('getTxConfs', () => {
    it('throws error for non-array input', () => {
      try {
        const badData = 'some non-array'

        txs.getTxConfs(badData)

        assert.equal(true, false, 'Unexpected result!')
      } catch (err) {
        // console.log(util.inspect(err))
        assert.include(err.message, 'txdata needs to be an array', 'Expected error message')
      }
    })

    it('should return a sorted array of txids and confirmations', async () => {
      // If unit test, use the mocking library instead of live calls.
      if (process.env.TEST_ENV === 'unit') {
        txs.BITBOX = bitboxMock
      }

      const addr = 'bchtest:qqafk2cvztl8yt70v5akaawucwrn94hl2yups7rzfn'
      const txids = await txs.getTransactions(addr)

      const result = txs.getTxConfs(txids.txs)
      // console.log(`result: ${util.inspect(result)}`)

      assert.isArray(result)
      assert.hasAllKeys(result[0], ['txid', 'confirmations'])
      assert.isString(result[0].txid)
      assert.isNumber(result[0].confirmations)

      // Validate sorting
      const firstConf = result[0].confirmations
      const lastConf = result[result.length - 1].confirmations
      assert.equal(firstConf < lastConf, true, 'Expected in sorted order')
    })
  })

  describe(`#getLastConfirmedTransaction`, () => {
    it(`should get the last confirmed transaction`, async () => {
      // If unit test, use the mocking library instead of live calls.
      if (process.env.TEST_ENV === 'unit') {
        txs.BITBOX = bitboxMock
      }

      const addr = `bchtest:qq8wqgxq0uu4y6k92pw9f7s6hxzfp9umsvtg39pzqf`

      const result = await txs.getLastConfirmedTransaction(addr)
      // console.log(`result: ${util.inspect(result)}`)

      assert.isString(result)
    })
  })

  describe(`#getLastConfirmedTransactions`, () => {
    it(`should get the last confirmed transactions`, async () => {
      // If unit test, use the mocking library instead of live calls.
      if (process.env.TEST_ENV === 'unit') {
        txs.BITBOX = bitboxMock
      }

      const addr = `bchtest:qq8wqgxq0uu4y6k92pw9f7s6hxzfp9umsvtg39pzqf`

      const result = await txs.getLastConfirmedTransactions(addr)
      // console.log(`result: ${util.inspect(result)}`)

      assert.isArray(result)
    })
  })
})
