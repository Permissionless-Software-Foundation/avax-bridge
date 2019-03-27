/*
  Unit and integration tests for bch.js library.

  TODO:
  - Fix unit test for only2Conf()
*/

'use strict'

const assert = require('chai').assert
const sinon = require('sinon')
const nock = require('nock')

const Transactions = require('../../src/lib/transactions')

const bitboxMock = require('bitbox-mock')
const txMockData = require('./mocks/transactions')

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

  describe('getUserAddr', () => {
    // See issue: https://github.com/Bitcoin-com/rest.bitcoin.com/issues/300
    /*
    it('should should throw an error for an invalid transaction', async () => {
      try {
        const txid = `cf1b5d374e171876a625599a489a2a6cdda119fb84b6cff2a226c39e189`

        await txs.getUserAddr(txid)

        assert(true, false, 'Unexpected result')
      } catch (err) {
        console.log(`err: `, err)
        assert.include(err, '502: Bad gateway')
      }
    })
    */

    it('should return senders cash address', async () => {
      // If unit test, use the mocking library instead of live calls.
      if (process.env.TEST_ENV === 'unit') {
        txs.BITBOX = bitboxMock
      }

      const txid = `0d457cf1b5d374e171876a625599a489a2a6cdda119fb84b6cff2a226c39e189`

      const senderAddr = await txs.getUserAddr(txid)
      // console.log(`senderAddr: ${util.inspect(senderAddr)}`)

      assert.isString(senderAddr)
      assert.equal(senderAddr, 'bchtest:qqafk2cvztl8yt70v5akaawucwrn94hl2yups7rzfn')
    })
  })

  describe(`only2Conf()`, () => {
    it(`should return true if confirmations are greater than 1`, async () => {
      const addr = `bchtest:qq8wqgxq0uu4y6k92pw9f7s6hxzfp9umsvtg39pzqf`

      const result = await txs.only2Conf(addr)
      // console.log(`result: ${util.inspect(result)}`)

      assert.equal(result, true)
    })

    // This test should only run as a unit test, not an integration test.
    if (process.env.TEST_ENV === 'unit') {
      it(`should return false if confirmations are less than 2`, async () => {
        // Mock out the data needed for this test.
        txMockData.mockTransactions.txs[0].confirmations = 0
        sandbox.stub(txs.BITBOX.Address, 'transactions')
          .resolves(txMockData.mockTransactions)

        const addr = `bchtest:qq8wqgxq0uu4y6k92pw9f7s6hxzfp9umsvtg39pzqf`
        // console.log(`blah: ${util.inspect(blah.txs[0].confirmations)}`)

        const result = await txs.only2Conf(addr)
        // console.log(`result: ${util.inspect(result)}`)

        assert.equal(result, false)
      })
    }
  })
})
