/*
  Unit and integration tests for bch.js library.
*/

'use strict'

const assert = require('chai').assert
const sinon = require('sinon')
const nock = require('nock')

const BCH = require('../../src/lib/bch')

const bitboxMock = require('bitbox-mock')
const bchMockData = require('./mocks/bch')

// Used for debugging.
const util = require('util')
util.inspect.defaultOptions = { depth: 1 }

// Determine if this is a Unit or Integration test
// If not specified, default to unit test.
if (!process.env.APP_ENV) process.env.APP_ENV = 'test'
if (!process.env.TEST_ENV) process.env.TEST_ENV = 'unit'
const REST_URL = `https://trest.bitcoin.com/v2/`

describe('#bch', () => {
  let sandbox
  let bch

  before(() => {})

  beforeEach(() => {
    bch = new BCH()

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

  describe('#getBCHBalance', () => {
    it('should get BCH balance', async () => {
      // If unit test, use the mocking library instead of live calls.
      if (process.env.TEST_ENV === 'unit') {
        sandbox
          .stub(bch.BITBOX.Address, 'details')
          .resolves(bchMockData.addressDetails)
      }

      const addr = 'bchtest:qq22ys5qz8z4jzkkex7p5jrdd9vh6q06cgrpsx2fu7'
      const verbose = false

      const bchBalance = await bch.getBCHBalance(addr, verbose)
      // console.log(`bchBalance: ${util.inspect(bchBalance)}`)

      assert.hasAllKeys(bchBalance, [
        'balance',
        'balanceSat',
        'totalReceived',
        'totalReceivedSat',
        'totalSent',
        'totalSentSat',
        'unconfirmedBalance',
        'unconfirmedBalanceSat',
        'unconfirmedTxApperances',
        'txApperances',
        'transactions',
        'legacyAddress',
        'cashAddress'
      ])
      assert.isArray(bchBalance.transactions)
    })
  })
})
