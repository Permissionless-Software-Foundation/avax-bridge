/*
  Unit and integration tests for slp.js library.
  TODO:
  - Incorporate slp-sdk-mock
*/

'use strict'

const assert = require('chai').assert
const sinon = require('sinon')
const SLP = require('../../src/utils/slp')

// Used for debugging.
const util = require('util')
util.inspect.defaultOptions = { depth: 1 }

// Mocking-data
// const { slpMock } = require('./mocks/slp')
const slpMock = require('slp-sdk-mock')

// Determine if this is a Unit or Integration test
// If not specified, default to unit test.
if (!process.env.APP_ENV) process.env.APP_ENV = 'test'
if (!process.env.TEST_ENV) process.env.TEST_ENV = 'unit'

describe('#slp', () => {
  let slp = new SLP({ restURL: 'https://trest.bitcoin.com/v2/' })
  let sandbox

  before(() => {})

  beforeEach(() => {
    // By default, use the mocking library instead of live calls.
    if (process.env.TEST_ENV === 'unit') slp.slpsdk = slpMock

    // mockedWallet = Object.assign({}, testwallet) // Clone the testwallet
    sandbox = sinon.createSandbox()
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('#getTokenBalance', () => {
    it('should get token balance', async () => {
      // const addr = 'simpleledger:qzl6k0wvdd5ky99hewghqdgfj2jhcpqnfqtaqr70rp'
      const addr = 'slptest:qz4qnxcxwvmacgye8wlakhz0835x0w3vtvxu67w0ac'

      const tokenBalance = await slp.getTokenBalance(addr)
      // console.log(`bchBalance: ${util.inspect(tokenBalance)}`)

      assert.isArray(tokenBalance)
      assert.hasAllKeys(tokenBalance[0], ['tokenId', 'balance', 'decimalCount'])
    })
  })
/*
  describe('#txDetails', () => {
    it('should return token tx details for a token tx', async () => {
      const txid =
        '61e71554a3dc18158f30d9e8f5c9b6641a789690b32302899f81cbea9fe3bb49'

      const tokenInfo = await slp.txDetails(txid)
      // console.log(`tokenInfo: ${util.inspect(tokenInfo)}`)

      assert.equal(tokenInfo.tokenIsValid, true)
    })

    it('should return false for non-token tx', async () => {
      const txid =
        'c5834f0f29810a6bfa6325ebc5606f043875e5e0454b68b16e5fa343e6f8e8de'

      const tokenInfo = await slp.txDetails(txid)
      // console.log(`tokenInfo: ${util.inspect(tokenInfo)}`)

      // assert.equal(tokenInfo, false, `Expect false returned for non-token tx`)
      assert.equal(tokenInfo.tokenIsValid, false)
    })
  })

  describe('#tokenTxInfo', () => {
    it('should return token quantity for a token tx', async () => {
      const txid =
        '61e71554a3dc18158f30d9e8f5c9b6641a789690b32302899f81cbea9fe3bb49'

      const tokenInfo = await slp.tokenTxInfo(txid)
      // console.log(`tokenInfo: ${util.inspect(tokenInfo)}`)

      assert.equal(tokenInfo, 10, 'Validate token transfer')
    })

    it('should return false for a non-token tx', async () => {
      const txid = 'c5834f0f29810a6bfa6325ebc5606f043875e5e0454b68b16e5fa343e6f8e8de'

      const tokenInfo = await slp.tokenTxInfo(txid)
      // console.log(`tokenInfo: ${util.inspect(tokenInfo)}`)

      assert.equal(tokenInfo, false, `Expect false returned for non-token tx`)
    })

    it('should return false for a token-tx of a different token type', async () => {
      const txid = '37279c7dc81ceb34d12f03344b601c582e931e05d0e552c29c428bfa39d39af3'

      const tokenInfo = await slp.tokenTxInfo(txid)
      // console.log(`tokenInfo: ${util.inspect(tokenInfo)}`)

      assert.equal(tokenInfo, false, `Expect false returned for non-psf token tx`)
    })
  })

  describe('#openWallet', () => {
    it('should open wallet file or report that wallet file does not exist', async () => {
      const walletInfo = await slp.openWallet()
      // console.log(`walletInfo: ${JSON.stringify(walletInfo, null, 2)}`)

      if (walletInfo.error) {
        assert.include(walletInfo.error, 'wallet file not found', 'Wallet file not found')
      } else {
        assert.equal(walletInfo.cashAddress, 'bchtest:qq8wqgxq0uu4y6k92pw9f7s6hxzfp9umsvtg39pzqf')
      }
    })
  })
*/
})
