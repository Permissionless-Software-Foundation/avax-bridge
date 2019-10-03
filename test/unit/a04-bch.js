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

      assert.hasAnyKeys(bchBalance, [
        'balance',
        'txids'
      ])
      assert.isArray(bchBalance.txids)
    })
  })

  describe(`findBiggestUtxo()`, () => {
    it(`should return the bigger utxo`, () => {
      const utxo1 = { satoshis: 10 }
      const utxo2 = { satoshis: 20 }
      const utxos = [utxo1, utxo2]

      const result = bch.findBiggestUtxo(utxos)
      // console.log(`result: ${util.inspect(result)}`)

      assert.equal(result.satoshis, 20, `bigger utxo value expected`)
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

      const txid = 'ed4692f50a4553527dd26cd8674ca06a0ab2d366f3135ca3668310467ead3cbf'
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
        sandbox
          .stub(bch, 'getBCHBalance')
          .resolves(bchMockData.balance)

        sandbox.stub(bch.BITBOX.Address, 'utxo')
          .resolves(bchMockData.utxos)
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
      const mnemonic = 'space waste topic swing park enrich disease release razor solution wait school'

      const result = await bch.changeAddrFromMnemonic(mnemonic)
      // console.log(`result: ${JSON.stringify(result, null, 2)}`)

      assert.hasAllKeys(result, ['keyPair', 'chainCode', 'depth', 'index', 'parentFingerprint'])
    })
  })
})
