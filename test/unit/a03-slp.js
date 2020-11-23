/*
  Unit and integration tests for slp.js library.
*/

'use strict'

const assert = require('chai').assert
const sinon = require('sinon')
const nock = require('nock')
const cloneDeep = require('lodash.clonedeep')

// Mocking-data
const slpMockData = require('./mocks/slp')
const mockWallet = require('./mocks/testwallet.json')
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

    slpMockDataCopy = cloneDeep(slpMockData)
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
        sandbox.stub(slp.bchjs.SLP.Utils, 'balancesForAddress').resolves([
          {
            tokenId:
              '155784a206873c98acc09e8dabcccf6abf13c4c14d8662190534138a16bb93ce',
            balance: 11999.16572854,
            slpAddress: 'slptest:qpt74e74f75w6s7cd8r9p5fumvdhqf995g69udvd5n',
            decimalCount: 8
          }
        ])
      }

      const tokenBalance = await slp.getTokenBalance()
      // console.log(`tokenBalance: ${JSON.stringify(tokenBalance, null, 2)}`)

      assert.isNumber(tokenBalance)
    })

    if (process.env.TEST_ENV === 'unit') {
      it('should return 0 on address with zero balance', async () => {
        sandbox
          .stub(slp.bchjs.SLP.Utils, 'balancesForAddress')
          .resolves('No balance for this address')

        const addr = 'slptest:qzayl9rxxprzst3fnydykx2rt4d746fcqqu0s50c9u'

        const result = await slp.getTokenBalance(addr)

        assert.equal(result, 0)
      })
    }
  })

  describe('#txDetails', () => {
    it('should return token tx details for a token tx', async () => {
      if (process.env.TEST_ENV === 'unit') {
        sandbox
          .stub(slp.bchjs.SLP.Utils, 'validateTxid')
          .resolves([{ valid: true }])

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
        // nock(config.TESTNET_REST)
        //   .get(uri => uri.includes('/'))
        //   .reply(200, testData)
        sandbox.stub(slp.bchjs.SLP.Utils, 'txDetails').resolves(testData)
      }

      const txid =
        '61e71554a3dc18158f30d9e8f5c9b6641a789690b32302899f81cbea9fe3bb49'

      const tokenInfo = await slp.txDetails(txid)
      // console.log(`tokenInfo: ${util.inspect(tokenInfo)}`)

      assert.equal(tokenInfo.tokenIsValid, true)
    })

    it('should return false for non-token tx', async () => {
      if (process.env.TEST_ENV === 'unit') {
        sandbox
          .stub(slp.bchjs.SLP.Utils, 'validateTxid')
          .resolves([{ valid: false }])

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
        nock(config.TESTNET_REST)
          .get(uri => uri.includes('/'))
          .reply(200, testData)
      }

      const txid =
        '6a2a8722fdbf16456f84245f2e74d4a355dac86e6faec9ce062834d1e82f6517'

      const tokenInfo = await slp.txDetails(txid)
      // console.log(`tokenInfo: ${util.inspect(tokenInfo)}`)

      // assert.equal(tokenInfo, false, `Expect false returned for non-token tx`)
      assert.equal(tokenInfo, false)
    })
  })

  describe('#tokenTxInfo', () => {
    it('should return token quantity for a token tx', async () => {
      if (process.env.TEST_ENV === 'unit') {
        slpMockDataCopy.tokenTx.tokenInfo.tokenIdHex = config.SLP_TOKEN_ID
        sandbox.stub(slp, 'txDetails').resolves(slpMockDataCopy.tokenTx)
      }

      const txid =
        '1e217cbb29bc58a945d5ab1e623bd5c4ab63c699052438dbe06f96d8043d2714'

      const tokenInfo = await slp.tokenTxInfo(txid)
      // console.log(`tokenInfo: ${util.inspect(tokenInfo)}`)

      assert.isAbove(tokenInfo, 0, 'Validate token transfer')
    })

    it('should return false for a non-token tx', async () => {
      if (process.env.TEST_ENV === 'unit') {
        sandbox.stub(slp, 'txDetails').resolves(slpMockData.nonTokenTx)
      }

      const txid =
        'c5834f0f29810a6bfa6325ebc5606f043875e5e0454b68b16e5fa343e6f8e8de'

      const tokenInfo = await slp.tokenTxInfo(txid)
      // console.log(`tokenInfo: ${util.inspect(tokenInfo)}`)

      assert.equal(tokenInfo, false, 'Expect false returned for non-token tx')
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
        'Expect false returned for non-psf token tx'
      )
    })
  })

  describe('#createTokenTx', () => {
    it('should throw an error if there are no BCH UTXOs', async () => {
      try {
        // Mock out down-stream dependencies for a unit test.
        sandbox.stub(slp.tlUtils, 'openWallet').returns(mockWallet)
        sandbox
          .stub(slp.bchjs.Electrumx, 'utxo')
          .resolves(slpMockDataCopy.fulcrumEmtpyUtxos)

        const addr = 'bchtest:qpwa35xq0q0cnmdu0rwzkct369hddzsqpsme94qqh2'
        const qty = 1

        await slp.createTokenTx(addr, qty, 245)
        // console.log(`result: ${JSON.stringify(result, null, 2)}`)
      } catch (err) {
        // console.log(`err.message: ${err.message}`)
        assert.include(
          err.message,
          'Wallet does not have a BCH UTXO to pay miner fees'
        )
      }
    })

    it('should throw an error if there are no token UTXOs', async () => {
      try {
        // Mock out down-stream dependencies for a unit test.
        sandbox.stub(slp.tlUtils, 'openWallet').returns(mockWallet)
        sandbox.stub(slp.bchjs.Electrumx, 'utxo').resolves(slpMockDataCopy.fulcrumUtxos)
        sandbox.stub(slp.bch, 'findBiggestUtxo').resolves(slpMockData.utxos[0])
        sandbox
          .stub(slp.bchjs.SLP.Utils, 'tokenUtxoDetails')
          .resolves([false, false])

        const addr = 'bchtest:qpwa35xq0q0cnmdu0rwzkct369hddzsqpsme94qqh2'
        const qty = 1

        await slp.createTokenTx(addr, qty, 245)
        // console.log(`result: ${JSON.stringify(result, null, 2)}`)
      } catch (err) {
        // console.log(`err.message: ${err.message}`)
        assert.include(err.message, 'No token UTXOs are available')
      }
    })

    it('should throw an error if there are no valid token UTXOs', async () => {
      try {
        // Mock out down-stream dependencies for a unit test.
        sandbox.stub(slp.tlUtils, 'openWallet').returns(mockWallet)
        sandbox.stub(slp.bchjs.Electrumx, 'utxo').resolves(slpMockDataCopy.fulcrumUtxos)
        sandbox
          .stub(slp.bchjs.SLP.Utils, 'tokenUtxoDetails')
          .resolves(slpMockData.tokenUtxos)
        sandbox.stub(slp.bch, 'findBiggestUtxo').resolves(slpMockData.utxos[0])
        sandbox.stub(slp.bchjs.Blockchain, 'getTxOut').resolves(null)

        const addr = 'bchtest:qpwa35xq0q0cnmdu0rwzkct369hddzsqpsme94qqh2'
        const qty = 1

        await slp.createTokenTx(addr, qty, 245)
        // console.log(`result: ${JSON.stringify(result, null, 2)}`)
      } catch (err) {
        // console.log(`err.message: ${err.message}`)
        assert.include(err.message, 'No token UTXOs are available')
      }
    })

    it('should generate a transaction hex', async () => {
      // Mock out down-stream dependencies for a unit test.
      sandbox.stub(slp.tlUtils, 'openWallet').returns(mockWallet)
      // sandbox.stub(slp.bchjs.Blockbook, 'utxo').resolves(slpMockData.utxos)
      sandbox
        .stub(slp.bchjs.Electrumx, 'utxo')
        .resolves(slpMockData.fulcrumUtxos)
      sandbox
        .stub(slp.bchjs.SLP.Utils, 'tokenUtxoDetails')
        .resolves(slpMockData.tokenUtxos)
      sandbox.stub(slp.bch, 'findBiggestUtxo').resolves(slpMockData.utxos[0])
      sandbox
        .stub(slp.bchjs.Blockchain, 'getTxOut')
        .resolves(slpMockData.validUtxo)

      const addr = 'bchtest:qpwa35xq0q0cnmdu0rwzkct369hddzsqpsme94qqh2'
      const qty = 1

      const result = await slp.createTokenTx(addr, qty, 245)
      // console.log(`result: ${JSON.stringify(result, null, 2)}`)

      assert.isString(result)
      assert.equal(result.indexOf('0200'), 0, 'First part of string matches.')
    })
  })

  describe('#burnTokenTx', () => {
    it('should throw an error if there are no BCH UTXOs', async () => {
      try {
        // Mock out down-stream dependencies for a unit test.
        sandbox.stub(slp.tlUtils, 'openWallet').returns(mockWallet)
        sandbox.stub(slp.bchjs.Blockbook, 'utxo').resolves([])

        const qty = 1

        await slp.burnTokenTx(qty)
        // console.log(`result: ${JSON.stringify(result, null, 2)}`)
      } catch (err) {
        console.log(`err.message: ${err.message}`)
        assert.include(
          err.message,
          'Wallet does not have a BCH UTXO to pay miner fees'
        )
      }
    })

    // it('should throw an error if there are no token UTXOs', async () => {
    //   try {
    //     // Mock out down-stream dependencies for a unit test.
    //     sandbox.stub(slp.tlUtils, 'openWallet').returns(mockWallet)
    //     sandbox
    //       .stub(slp.bchjs.Blockbook, 'utxo')
    //       .resolves(slpMockData.utxos)
    //       .onCall(1)
    //       .resolves(slpMockData.utxos)
    //     sandbox
    //       .stub(slp.bchjs.SLP.Utils, 'tokenUtxoDetails')
    //       .resolves([false, false])
    //
    //     const qty = 1
    //
    //     await slp.burnTokenTx(qty)
    //     // console.log(`result: ${JSON.stringify(result, null, 2)}`)
    //   } catch (err) {
    //     console.log('err: ', err)
    //     // console.log(`err.message: ${err.message}`)
    //     assert.include(err.message, 'No token UTXOs are available')
    //   }
    // })

    it('should throw an error if there are no valid token UTXOs', async () => {
      try {
        // Mock out down-stream dependencies for a unit test.
        sandbox.stub(slp.tlUtils, 'openWallet').returns(mockWallet)
        sandbox.stub(slp.bchjs.Electrumx, 'utxo').resolves(slpMockData.fulcrumUtxos)
        sandbox
          .stub(slp.bchjs.SLP.Utils, 'tokenUtxoDetails')
          .resolves(slpMockData.tokenUtxos)
        sandbox.stub(slp.bch, 'findBiggestUtxo').resolves(slpMockData.utxos[0])
        sandbox.stub(slp.bchjs.Blockchain, 'getTxOut').resolves(null)

        const qty = 1

        await slp.burnTokenTx(qty)
        // console.log(`result: ${JSON.stringify(result, null, 2)}`)
      } catch (err) {
        // console.log(`err.message: ${err.message}`)
        assert.include(err.message, 'No token UTXOs are available')
      }
    })

    it('should generate a transaction hex', async () => {
      // Mock out down-stream dependencies for a unit test.
      sandbox.stub(slp.tlUtils, 'openWallet').returns(mockWallet)
      sandbox.stub(slp.bchjs.Electrumx, 'utxo').resolves(slpMockData.fulcrumUtxos)
      sandbox
        .stub(slp.bchjs.SLP.Utils, 'tokenUtxoDetails')
        .resolves(slpMockData.tokenUtxos)
      sandbox.stub(slp.bch, 'findBiggestUtxo').resolves(slpMockData.utxos[0])
      sandbox
        .stub(slp.bchjs.Blockchain, 'getTxOut')
        .resolves(slpMockData.validUtxo)

      const qty = 1

      const result = await slp.burnTokenTx(qty)
      // console.log(`result: ${JSON.stringify(result, null, 2)}`)

      assert.isString(result)
      assert.equal(result.indexOf('0200'), 0, 'First part of string matches.')
    })
  })

  // Unit tests only.
  if (process.env.TEST_ENV === 'unit') {
    describe('#broadcastTokenTx', () => {
      it('should broadcast a tx and return the txid', async () => {
        // Mock out dependency.
        sandbox
          .stub(slp.bchjs.RawTransactions, 'sendRawTransaction')
          .resolves('txid')

        const hex = '0200...'

        const result = await slp.broadcastTokenTx(hex)

        assert.equal(result, 'txid')
      })
    })
  }
})
