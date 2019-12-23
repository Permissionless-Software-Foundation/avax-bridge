/*
  Unit and integration tests for slp.js library.
*/

'use strict'

const assert = require('chai').assert
const sinon = require('sinon')
const nock = require('nock')

// Mocking-data
const slpMockData = require('./mocks/slp')
// const slpMock = require('slp-sdk-mock')

const config = require('../../config')

// Determine if this is a Unit or Integration test
// If not specified, default to unit test.
if (!process.env.APP_ENV) process.env.APP_ENV = 'test'
if (!process.env.TEST_ENV) process.env.TEST_ENV = 'unit'

const SLP = require('../../src/lib/slp')

describe('#slp', () => {
  let slp
  let sandbox
  let slpMockDataCopy

  before(() => {})

  beforeEach(() => {
    slp = new SLP()

    // mockedWallet = Object.assign({}, testwallet) // Clone the testwallet
    sandbox = sinon.createSandbox()

    // Activate nock if it's inactive.
    if (!nock.isActive()) nock.activate()

    slpMockDataCopy = Object.assign({}, slpMockData)
  })

  afterEach(() => {
    // Clean up HTTP mocks.
    nock.cleanAll() // clear interceptor list.
    nock.restore()

    sandbox.restore()
  })

  describe('#createTokenTx', () => {
    it('should throw an error if there are no valid token UTXOs', async () => {
      try {
        // Mock out down-stream dependencies for a unit test.
        sandbox.stub(slp.bchjs.Blockbook, 'utxo').resolves(slpMockData.utxos)
        sandbox
          .stub(slp.bchjs.SLP.Utils, 'tokenUtxoDetails')
          .resolves(slpMockData.tokenUtxos)
        sandbox.stub(slp.bch, 'findBiggestUtxo').resolves(slpMockData.utxos[0])
        sandbox.stub(slp.bchjs.Blockchain, 'getTxOut').resolves(null)

        const addr = 'bchtest:qpwa35xq0q0cnmdu0rwzkct369hddzsqpsme94qqh2'
        const qty = 1

        await slp.createTokenTx(addr, qty)
        // console.log(`result: ${JSON.stringify(result, null, 2)}`)
      } catch (err) {
        console.log(`err.message: ${err.message}`)
        assert.include(err.message, 'No token UTXOs are available')
      }
    })

    it('should generate a transaction hex', async () => {
      // Mock out down-stream dependencies for a unit test.
      sandbox.stub(slp.bchjs.Blockbook, 'utxo').resolves(slpMockData.utxos)
      sandbox
        .stub(slp.bchjs.SLP.Utils, 'tokenUtxoDetails')
        .resolves(slpMockData.tokenUtxos)
      sandbox.stub(slp.bch, 'findBiggestUtxo').resolves(slpMockData.utxos[0])
      sandbox
        .stub(slp.bchjs.Blockchain, 'getTxOut')
        .resolves(slpMockData.validUtxo)

      const addr = 'bchtest:qpwa35xq0q0cnmdu0rwzkct369hddzsqpsme94qqh2'
      const qty = 1

      const result = await slp.createTokenTx(addr, qty)
      // console.log(`result: ${JSON.stringify(result, null, 2)}`)

      assert.isString(result)
      assert.equal(result.indexOf('0200'), 0, 'First part of string matches.')
    })
  })
})
