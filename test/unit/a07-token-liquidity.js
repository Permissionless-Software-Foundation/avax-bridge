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
const libMockData = require('./mocks/token-liquidity-mock')

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

    it('should calculate values in the spreadsheet', () => {
      const exchangeObj = {
        tokenIn: 5000,
        tokenBalance: 15000,
        bchOriginalBalance: 25,
        tokenOriginalBalance: 5000
      }

      const result = lib.exchangeTokensForBCH(exchangeObj)
      // console.log(`result: ${result}`)

      assert.isNumber(result)
      assert.equal(result, 2.13870808, `Should match spreadsheet`)
    })

    it('should calculate values in the spreadsheet', () => {
      const exchangeObj = {
        tokenIn: 500,
        tokenBalance: 1000,
        bchOriginalBalance: 25,
        tokenOriginalBalance: 5000
      }

      const result = lib.exchangeTokensForBCH(exchangeObj)
      // console.log(`result: ${result}`)

      assert.isNumber(result)
      assert.equal(result, 5.29470823, `Should match spreadsheet`)
    })
  })

  describe('exchangeBCHForTokens', () => {
    it('should calculate values in the spreadsheet', () => {
      const exchangeObj = {
        // bchIn: 1.181410849,
        bchIn: 1.30565831,
        bchBalance: 12.41463259,
        bchOriginalBalance: 25,
        tokenOriginalBalance: 5000
      }

      const result = lib.exchangeBCHForTokens(exchangeObj)
      // console.log(`result: ${util.inspect(result)}`)

      assert.hasAllKeys(result, ['tokensOut', 'bch2', 'token2'])
      assert.equal(
        Math.floor(result.tokensOut),
        499,
        `Should match spreadsheet`
      )
      assert.isNumber(result.bch2)
      assert.isNumber(result.token2)
    })

    it('should calculate values in the spreadsheet', () => {
      const exchangeObj = {
        bchIn: 5.81360394,
        bchBalance: 3.38338208,
        bchOriginalBalance: 25,
        tokenOriginalBalance: 5000
      }

      const result = lib.exchangeBCHForTokens(exchangeObj)
      // console.log(`result: ${util.inspect(result)}`)

      assert.hasAllKeys(result, ['tokensOut', 'bch2', 'token2'])
      assert.equal(
        Math.floor(result.tokensOut),
        4999,
        `Should match spreadsheet`
      )
      assert.isNumber(result.bch2)
      assert.isNumber(result.token2)
    })
  })

  describe('#detectNewTxs', () => {
    it('should return new txs', async () => {
      const knownTxids = libMockData.knownTxids

      const obj = {
        seenTxs: knownTxids.slice(0, -1)
      }

      // If unit test, use the mocking library instead of live calls.
      if (process.env.TEST_ENV === 'unit') {
        sandbox.stub(lib.bch, 'getBCHBalance').resolves(libMockData.addrInfo)
        sandbox.stub(lib.txs, 'getTxConfirmations').resolves(libMockData.confs)
      }

      const result = await lib.detectNewTxs(obj)
      // console.log(`result: ${JSON.stringify(result, null, 2)}`)

      assert.isArray(result)
      assert.hasAllKeys(result[0], ['txid', 'confirmations'])
    })
  })

  describe('#pRetryProcessTx function', () => {
    it('should throw error if parameters are not defined', async () => {
      try {
        await lib.pRetryProcessTx()
      } catch (error) {
        assert.include(error.message, `Error in "pRetryProcessTx" functions`)
      }
    })

    it('Should return object', async () => {
      console.log('init test')
      const obj = {
        txid:
          '14df82e3ec54fa0227531309f7189ed695bafad6f5062407d3a528fbeddc4a09',
        bchBalance: 12.01044695,
        tokenBalance: 1
      }
      sandbox.stub(lib, 'processTx').resolves(libMockData.processTx)
      try {
        const result = await lib.pRetryProcessTx(obj)
        assert.hasAllKeys(result, ['txid', 'bchBalance', 'tokenBalance'])
      } catch (error) {
        console.log(error)
        // assert.include(error.message, `Error in "pRetryProcessTx" functions`)
      }
    })
  })

  // Only run these tests for a unit test.
  if (process.env.TEST_ENV === 'unit') {
    describe('compareLastTransaction', () => {
      /*
        it(`should return false if transactions are the same`, async () => {
          const obj = {
            bchAddr: `bchtest:qq8wqgxq0uu4y6k92pw9f7s6hxzfp9umsvtg39pzqf`,
            txid: `9f56ba221d862e41f33b564e49ddffc66ec9b5bcaf4669d40e1d890ade4817bc`,
            bchBalance: 25,
            tokenBalance: 5000
          }

          const result = await lib.compareLastTransaction(obj, tknLib, bchLib, BITBOX)
          console.log(`result: ${util.inspect(result)}`)

          assert.equal(result, false, 'return false expected')
        })
        */
      /*
      it('should send BCH in exchange for tokens', async () => {
        const obj = {
          bchAddr: `bchtest:qq8wqgxq0uu4y6k92pw9f7s6hxzfp9umsvtg39pzqf`,
          txid: `298e9186a2113443f3b2064ee0bf0ae1973434ae48e9ec3c3e27bfea41d41b05`,
          bchBalance: 7.68905269,
          tokenBalance: 100000
        }

        const result = await lib.compareLastTransaction(obj)
        // console.log(`result: ${util.inspect(result)}`)

        // Should return the last transactions, as well as the new balance of BCH
        // and the token.
        assert.hasAllKeys(result, [
          'lastTransaction',
          'bchBalance'
          // 'tokenBalance'
        ])
      })

      it('should send tokens in exchange for BCH', async () => {
        const obj = {
          bchAddr: `bchtest:qq8wqgxq0uu4y6k92pw9f7s6hxzfp9umsvtg39pzqf`,
          txid: `a77762bb47c130e755cc053db51333bbd64596eefd18baffc08a447749863fa9`,
          bchBalance: 7.68905269,
          tokenBalance: 100000
        }
        //

        const result = await lib.compareLastTransaction(obj)
        // console.log(`result: ${util.inspect(result)}`)

        // Should return the last transactions, as well as the new balance of BCH
        // and the token.
        assert.hasAllKeys(result, [
          'lastTransaction',
          'bchBalance'
          // 'tokenBalance'
        ])
      })
      */
    })
  }
})
