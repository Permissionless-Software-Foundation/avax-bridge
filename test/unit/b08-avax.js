/*
  Unit and integration tests for avax.js library.
*/

'use strict'

const assert = require('chai').assert
const sinon = require('sinon')
const cloneDeep = require('lodash.clonedeep')

const AVAX = require('../../src/lib/avax')

const avaxMockDataLib = require('./mocks/avax.mock')
// const mockWallet = require('./mocks/testwallet.json')

const config = require('../../config')

// If not specified, default to unit test.
if (!process.env.TL_ENV) process.env.TL_ENV = 'test'

describe('#avax-lib', () => {
  let sandbox
  let uut
  let avaxMockData

  before(() => {})

  beforeEach(() => {
    uut = new AVAX(config)

    avaxMockData = cloneDeep(avaxMockDataLib)

    // mockedWallet = Object.assign({}, testwallet) // Clone the testwallet
    sandbox = sinon.createSandbox()
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('#getTransactions', () => {
    it('should get Token balance in the given avalanche address', async () => {
      sandbox
        .stub(uut.axios, 'post')
        .resolves({ status: 200, data: avaxMockData.txHistory })

      const addr = 'X-avax150agl543yn0n5z9z20tgmrggs8fc2ckkma4qfv'

      const historicalTxs = await uut.getTransactions(addr)

      assert.isArray(historicalTxs)
    })

    it('should catch and throw errors if address is not string', async () => {
      try {
        const addr = ''

        await uut.getTransactions(addr)

        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(err.message, 'is not valid')
      }
    })

    it('should catch and throw errors', async () => {
      try {
        // Force an error
        sandbox
          .stub(uut.axios, 'post')
          .resolves({ status: 400 })

        const addr = 'X-avax150agl543yn0n5z9z20tgmrggs8fc2ckkma4qfv'

        await uut.getTransactions(addr)

        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(err.message, 'No transaction history ')
      }
    })
  })

  describe('#getTokenBalance', () => {
    it('should get token balance in the address', async () => {
      sandbox
        .stub(uut.slpAvaxBridgeLib.avax.xchain, 'getBalance')
        .resolves(new uut.slpAvaxBridgeLib.avax.BN(2000))

      const addr = 'X-avax150agl543yn0n5z9z20tgmrggs8fc2ckkma4qfv'

      const balance = await uut.getTokenBalance(addr)

      assert.equal(balance, 2000)
    })

    it('should get token balance in the address with decimals', async () => {
      sandbox
        .stub(uut.slpAvaxBridgeLib.avax.xchain, 'getBalance')
        .resolves(new uut.slpAvaxBridgeLib.avax.BN(2000))
      sandbox
        .stub(uut.slpAvaxBridgeLib.avax.xchain, 'getAssetDescription')
        .resolves({ denomination: 2 })

      const addr = 'X-avax150agl543yn0n5z9z20tgmrggs8fc2ckkma4qfv'

      const balance = await uut.getTokenBalance(addr, true)

      assert.equal(balance, 20.00)
    })
  })

  describe('#justTxs', () => {
    it('should return an array with only the txids', () => {
      const txHistory = avaxMockData.txHistory.data.transactions.results
      const txids = uut.justTxs(txHistory)

      assert.isArray(txids)
      assert(txids.length > 0)
      assert.isString(txids[0])
    })
  })

  describe('#filterNewTx', () => {
    it('should return only the new txs', () => {
      const txHistory = avaxMockData.txHistory.data.transactions.results
      const newTx = avaxMockData.knownTxids.slice(-1)
      const txs = uut.filterNewTx(newTx, txHistory)

      assert.isArray(txs)
      assert.hasAllKeys(txs[0], ['id', 'memo', 'inputs', 'outputs'])
    })
  })

  describe('#getUserAddress', () => {
    it('should return the senders address', () => {
      const address = uut.getUserAddress(avaxMockData.formatedTx)
      assert.equal(address, avaxMockData.senderAddress)
    })
  })
})
