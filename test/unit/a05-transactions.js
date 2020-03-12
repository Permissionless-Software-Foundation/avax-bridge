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

// const bitboxMock = require('bitbox-mock')
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

  describe('#getTxConfirmations', () => {
    it('should throw an error if input is not an array', async () => {
      try {
        const txids = 'bad-data'

        await txs.getTxConfirmations(txids)

        assert.equal(true, false, 'Unexpected result')
      } catch (err) {
        assert.include(err.message, 'txids needs to be an array')
      }
    })

    it('should get confirmation information about a tx', async () => {
      // If unit test, use the mocking library instead of live calls.
      if (process.env.TEST_ENV === 'unit') {
        sandbox.stub(txs.BITBOX.RawTransactions, 'getRawTransaction').resolves([
          {
            txid:
              '83147001c579d0c3f3150fc733c43af602e44fa157de9bbd74aa0d47062e55f5',
            confirmations: 55
          }
        ])
      }

      const txids = [
        '83147001c579d0c3f3150fc733c43af602e44fa157de9bbd74aa0d47062e55f5'
      ]

      const result = await txs.getTxConfirmations(txids)
      // console.log(`result: ${JSON.stringify(result, null, 2)}`)

      assert.isArray(result)
      assert.hasAllKeys(result[0], ['txid', 'confirmations'])
    })
  })

  describe('getUserAddr', () => {
    it('should should throw an error for an invalid transaction', async () => {
      try {
        // If unit test, use the mocking library instead of live calls.
        if (process.env.TEST_ENV === 'unit') {
          sandbox.stub(txs.BITBOX.Blockbook, 'tx').throws({
            error: 'txid must be of length 64 (not 59)'
          })
        }

        const txid = `cf1b5d374e171876a625599a489a2a6cdda119fb84b6cff2a226c39e189`

        await txs.getUserAddr(txid)
        // console.log(`result: ${util.inspect(result)}`)

        assert(true, false, 'Unexpected result')
      } catch (err) {
        // console.log(`err: `, err)

        assert.hasAllKeys(err, ['error'])
        assert.isString(err.error)
      }
    })

    it('should return senders cash address', async () => {
      // If unit test, use the mocking library instead of live calls.
      if (process.env.TEST_ENV === 'unit') {
        sandbox
          .stub(txs.BITBOX.Blockbook, 'tx')
          .resolves(txMockData.mockTransactions)
      }

      const txid = `af30cc46356378cb5f139fb9da301d3b06a50416eb5030e3d397d6c3c027a26d`

      const senderAddr = await txs.getUserAddr(txid)
      // console.log(`senderAddr: ${util.inspect(senderAddr)}`)

      assert.isString(senderAddr)
      assert.equal(
        senderAddr,
        'bchtest:qpyrwjq5c8euxyuwyqqdt40qf00dkfw02q6aqhm2wt'
      )
    })
  })
})
