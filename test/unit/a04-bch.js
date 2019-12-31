/*
  Unit and integration tests for bch.js library.
*/

'use strict'

const assert = require('chai').assert
const sinon = require('sinon')
const nock = require('nock')

const BCH = require('../../src/lib/bch')

// const bitboxMock = require('bitbox-mock')
const bchMockData = require('./mocks/bch')
const mockWallet = require('./mocks/testwallet.json')

const config = require('../../config')

// Used for debugging.
const util = require('util')
util.inspect.defaultOptions = { depth: 1 }

// Determine if this is a Unit or Integration test
// If not specified, default to unit test.
if (!process.env.APP_ENV) process.env.APP_ENV = 'test'
if (!process.env.TEST_ENV) process.env.TEST_ENV = 'unit'
// const REST_URL = `https://trest.bitcoin.com/v2/`

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
          .stub(bch.BITBOX.Blockbook, 'balance')
          .resolves(bchMockData.balance)
      }

      const addr = 'bchtest:qq22ys5qz8z4jzkkex7p5jrdd9vh6q06cgrpsx2fu7'
      const verbose = false

      const bchBalance = await bch.getBCHBalance(addr, verbose)
      // console.log(`bchBalance: ${util.inspect(bchBalance)}`)

      assert.hasAnyKeys(bchBalance, ['balance', 'txids'])
      assert.isArray(bchBalance.txids)
    })
  })

  describe(`findBiggestUtxo()`, () => {
    it(`should throw an error if utxos is not an array`, async () => {
      try {
        const utxos = { satoshis: 10 }
        await bch.findBiggestUtxo(utxos)
      } catch (err) {
        assert.include(
          err.message,
          `utxos needs to be an array`,
          'Expected error message.'
        )
      }
    })

    it(`should return the bigger utxo`, async () => {
      const utxos = [
        {
          txid:
            'fe3c23dfefe37efc4227c93d9b4f6eadc94dce3844156b9651a46e9b740d27dd',
          vout: 1,
          amount: 0.00000546,
          satoshis: 546,
          height: 1348643,
          confirmations: 5
        },
        {
          txid:
            '03fa935916161425d4db11c3f4cc7fc6b9cbea01ded88fe4818c41ccf5431e5c',
          vout: 1,
          amount: 12.04311016,
          satoshis: 1000,
          height: 1348645,
          confirmations: 3
        }
      ]

      // Stub the getTxOut network call.
      sandbox
        .stub(bch.BITBOX.Blockchain, 'getTxOut')
        .resolves(bchMockData.getTxOutValid)

      const result = await bch.findBiggestUtxo(utxos)
      // console.log(`blah result: ${JSON.stringify(result, null, 2)}`)

      assert.equal(result.satoshis, 1000, `bigger utxo value expected`)
    })
  })

  describe('recievedBch', () => {
    it('should return 0 if address is not in TX', async () => {
      // If unit test, use the mocking library instead of live calls.
      if (process.env.TEST_ENV === 'unit') {
        // bch.BITBOX.B = bitboxMock
        sandbox.stub(bch.BITBOX.Blockbook, 'tx').resolves(bchMockData.txDetails)
      }

      const txid =
        'a77762bb47c130e755cc053db51333bbd64596eefd18baffc08a447749863fa9'
      const addr = `bchtest:qq8wqgxq0uu4y6k92pw9f7s6hxzfp9umsvtg39pabc`

      const value = await bch.recievedBch(txid, addr)

      assert.isNumber(value)
      assert.equal(value, 0, 'Expect 0')
    })

    it('should calculate amount of BCH recieved from a TX', async () => {
      // If unit test, use the mocking library instead of live calls.
      if (process.env.TEST_ENV === 'unit') {
        // bch.BITBOX.B = bitboxMock
        sandbox.stub(bch.BITBOX.Blockbook, 'tx').resolves(bchMockData.txDetails)
      }

      const txid =
        'ed4692f50a4553527dd26cd8674ca06a0ab2d366f3135ca3668310467ead3cbf'
      const addr = `bchtest:qrvn2n228aa39xupcw9jw0d3fj8axxky656e4j62z2`

      const value = await bch.recievedBch(txid, addr)
      // console.log(`value: ${util.inspect(value)}`)

      assert.isNumber(value)
      assert.equal(value, 0.00001)
    })
  })

  describe('#createBchTx', () => {
    it('should send BCH', async () => {
      // If unit test, use the mocking library instead of live network calls.
      if (process.env.TEST_ENV === 'unit') {
        sandbox.stub(bch.tlUtils, 'openWallet').returns(mockWallet)

        sandbox.stub(bch, 'getBCHBalance').resolves(bchMockData.balance)

        sandbox.stub(bch.BITBOX.Blockbook, 'utxo').resolves(bchMockData.utxos)

        sandbox.stub(bch, 'findBiggestUtxo').resolves(bchMockData.utxos[1])
      }

      const obj = {
        recvAddr: config.BCH_ADDR,
        satoshisToSend: 1000
      }

      const hex = await bch.createBchTx(obj)
      // console.log(hex)

      assert.isString(hex)
    })
  })

  describe('#changeAddrFromMnemonic', () => {
    it('should return a change address', async () => {
      const mnemonic =
        'space waste topic swing park enrich disease release razor solution wait school'

      const result = await bch.changeAddrFromMnemonic(mnemonic)
      // console.log(`result: ${JSON.stringify(result, null, 2)}`)

      assert.hasAllKeys(result, [
        'keyPair',
        'chainCode',
        'depth',
        'index',
        'parentFingerprint'
      ])
    })
  })

  describe('#readOpReturn', () => {
    it('should return isValid=false for invalid txid', async () => {
      // Mock network calls.
      sandbox
        .stub(bch.BITBOX.RawTransactions, 'getRawTransaction')
        .throws({
          error:
            'No such mempool or blockchain transaction. Use gettransaction for wallet transactions.'
        })

      const txid = `4894f89965809733f728e3b3f22d0015c0bf87b6a809db00a82f2841303d9555`

      const opReturnData = await bch.readOpReturn(txid)
      // console.log(`opReturnData: ${JSON.stringify(opReturnData, null, 2)}`)

      assert.equal(opReturnData.isValid, false)
    })

    it('should return isValid=false for non-op-return tx', async () => {
      // Mock network calls.
      sandbox
        .stub(bch.BITBOX.RawTransactions, 'getRawTransaction')
        .resolves(bchMockData.noOpReturnTx)

      const txid = `4894f89965809733f728e3b3f22d0015c0bf87b6a809db00a82f2841303d9de3`

      const opReturnData = await bch.readOpReturn(txid)
      // console.log(`opReturnData: ${JSON.stringify(opReturnData, null, 2)}`)

      assert.equal(opReturnData.isValid, false)
    })

    it('should processes a valid burn command', async () => {
      // Mock network calls.
      sandbox
        .stub(bch.BITBOX.RawTransactions, 'getRawTransaction')
        .resolves(bchMockData.burnOpReturnTx)

      const txid = `73e0b24ab94413c8bf003168c533653b91c9409218cf4ed601b77734856770d1`

      const opReturnData = await bch.readOpReturn(txid)
      // console.log(`opReturnData: ${JSON.stringify(opReturnData, null, 2)}`)

      assert.equal(opReturnData.isValid, true)
      assert.equal(opReturnData.type, 'burn')
      assert.equal(opReturnData.qty, 10)
    })
  })
})
