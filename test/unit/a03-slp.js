/*
  Unit and integration tests for slp.js library.
*/

'use strict'

const assert = require('chai').assert
const sinon = require('sinon')
const SLP = require('../../src/lib/slp')
const nock = require('nock')

// Used for debugging.
const util = require('util')
util.inspect.defaultOptions = { depth: 1 }

// Mocking-data
const slpMockData = require('./mocks/slp')
// const slpMock = require('slp-sdk-mock')

// Determine if this is a Unit or Integration test
// If not specified, default to unit test.
if (!process.env.APP_ENV) process.env.APP_ENV = 'test'
if (!process.env.TEST_ENV) process.env.TEST_ENV = 'unit'

const REST_URL = `https://trest.bitcoin.com/v2/`

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

  describe('#getTokenBalance', () => {
    it('should get token balance', async () => {
      // If unit test, use the mocking library instead of live calls.
      if (process.env.TEST_ENV === 'unit') {
        sandbox.stub(slp.slpsdk.Utils, 'balancesForAddress')
          .resolves([
            {
              tokenId: '7ac7f4bb50b019fe0f5c81e3fc13fc0720e130282ea460768cafb49785eb2796',
              balance: '19882.09163133',
              decimalCount: 8
            }
          ])
      }

      // const addr = 'simpleledger:qzl6k0wvdd5ky99hewghqdgfj2jhcpqnfqtaqr70rp'
      const addr = 'slptest:qz2uhf4dj7a56m6cacpwwrkz4c4jwknqsgzv37ktge'

      const tokenBalance = await slp.getTokenBalance(addr)
      // console.log(`tokenBalance: ${util.inspect(tokenBalance)}`)

      assert.isNumber(tokenBalance)
    })

    it(`should throw an error for an invalid address`, async () => {
      if (process.env.TEST_ENV === 'unit') {
        // slp.slpsdk.Utils.balancesForAddress = sandbox.throws()
        sandbox.stub(slp.slpsdk.Utils, 'balancesForAddress').throws({
          error:
            'Invalid BCH address. Double check your address is valid: slptest:qz4qnxcxwvmacgye8wlakhz0835x0w3vtvxu67aaaa'
        })
      }

      try {
        const addr = 'slptest:qz4qnxcxwvmacgye8wlakhz0835x0w3vtvxu67aaaa'

        await slp.getTokenBalance(addr)

        assert.equal(true, false, 'Unexpected result')
      } catch (err) {
        // console.log(`Error obj: ${util.inspect(err)}`)

        assert.include(
          err.error,
          'Invalid BCH address',
          'Error message expected.'
        )
      }
    })

    it('should return 0 on address with zero balance', async () => {
      if (process.env.TEST_ENV === 'unit') {
        sandbox
          .stub(slp.slpsdk.Utils, 'balancesForAddress')
          .resolves('No balance for this address')
      }

      const addr = 'bchtest:qphvf5z3h24e8n2cexyr56g0tyrcrlc8wuaatqhg7z'

      const result = await slp.getTokenBalance(addr)

      assert.equal(result, 0)
    })
  })

  describe('#txDetails', () => {
    it('should return token tx details for a token tx', async () => {
      if (process.env.TEST_ENV === 'unit') {
        const testData = {
          txid:
            '61e71554a3dc18158f30d9e8f5c9b6641a789690b32302899f81cbea9fe3bb49',
          version: 2,
          locktime: 0,
          vin: [{}, {}],
          vout: [{}, {}, {}, {}],
          blockhash:
            '0000000095869fd09aaf838a3ab6f49c3c864518dca8f8115942672088bacfdd',
          blockheight: 1286350,
          confirmations: 8997,
          time: 1550269692,
          blocktime: 1550269692,
          valueOut: 0.09998613,
          size: 480,
          valueIn: 0.09999095,
          fees: 0.00000482,
          tokenInfo: {
            versionType: 1,
            transactionType: 'SEND',
            tokenIdHex:
              '7ac7f4bb50b019fe0f5c81e3fc13fc0720e130282ea460768cafb49785eb2796',
            sendOutputs: [Array]
          },
          tokenIsValid: true
        }

        // Mock the http call to rest.
        nock(REST_URL)
          .get(uri => uri.includes('/'))
          .reply(200, testData)
      }

      const txid =
        '61e71554a3dc18158f30d9e8f5c9b6641a789690b32302899f81cbea9fe3bb49'

      const tokenInfo = await slp.txDetails(txid)
      // console.log(`tokenInfo: ${util.inspect(tokenInfo)}`)

      assert.equal(tokenInfo.tokenIsValid, true)
    })

    it('should return false for non-token tx', async () => {
      if (process.env.TEST_ENV === 'unit') {
        const testData = {
          txid:
            'c5834f0f29810a6bfa6325ebc5606f043875e5e0454b68b16e5fa343e6f8e8de',
          version: 2,
          locktime: 0,
          vin: [{}],
          vout: [{}],
          blockhash:
            '00000000620398a0b58971cd64bff9aba9c7912d0eb1248a44af851cd97421fe',
          blockheight: 1292573,
          confirmations: 2780,
          time: 1552533771,
          blocktime: 1552533771,
          valueOut: 0.20002845,
          size: 191,
          valueIn: 0.20003057,
          fees: 0.00000212,
          tokenInfo: null,
          tokenIsValid: false
        }

        // Mock the http call to rest.
        nock(REST_URL)
          .get(uri => uri.includes('/'))
          .reply(200, testData)
      }

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
      if (process.env.TEST_ENV === 'unit') {
        slpMockDataCopy.tokenTx.tokenInfo.tokenIdHex =
          '7ac7f4bb50b019fe0f5c81e3fc13fc0720e130282ea460768cafb49785eb2796'
        sandbox.stub(slp, 'txDetails').resolves(slpMockDataCopy.tokenTx)
      }

      const txid =
        '62fff39843860bb3aa1e37ae22a7a99abab16d34c7a0b64bfdc23493ea97f24d'

      const tokenInfo = await slp.tokenTxInfo(txid)
      // console.log(`tokenInfo: ${util.inspect(tokenInfo)}`)

      assert.equal(tokenInfo, 1, 'Validate token transfer')
    })

    it('should return false for a non-token tx', async () => {
      if (process.env.TEST_ENV === 'unit') {
        sandbox.stub(slp, 'txDetails').resolves(slpMockData.nonTokenTx)
      }

      const txid =
        'c5834f0f29810a6bfa6325ebc5606f043875e5e0454b68b16e5fa343e6f8e8de'

      const tokenInfo = await slp.tokenTxInfo(txid)
      // console.log(`tokenInfo: ${util.inspect(tokenInfo)}`)

      assert.equal(tokenInfo, false, `Expect false returned for non-token tx`)
    })

    it('should return false for a token-tx of a different token type', async () => {
      if (process.env.TEST_ENV === 'unit') {
        sandbox.stub(slp, 'txDetails').resolves(slpMockData.otherTokenTx)
      }

      const txid =
        '37279c7dc81ceb34d12f03344b601c582e931e05d0e552c29c428bfa39d39af3'

      const tokenInfo = await slp.tokenTxInfo(txid)
      // console.log(`tokenInfo: ${util.inspect(tokenInfo)}`)

      assert.equal(
        tokenInfo,
        false,
        `Expect false returned for non-psf token tx`
      )
    })
  })

  describe('#createTokenTx', () => {
    it('should generate a SLP config object', () => {
      const addr = 'bchtest:qpwa35xq0q0cnmdu0rwzkct369hddzsqpsme94qqh2'
      const qty = 1

      const result = slp.createTokenTx(addr, qty)
      // console.log(`result: ${util.inspect(result)}`)

      assert.hasAllKeys(result, [
        'fundingAddress',
        'fundingWif',
        'tokenReceiverAddress',
        'bchChangeReceiverAddress',
        'tokenId',
        'amount'
      ])
    })
  })
})
