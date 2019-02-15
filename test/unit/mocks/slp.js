/*
  Contains mock of SLP SDK, which extends the BITBOX SDK mock.
*/

'use strict'

const sinon = require('sinon')
const { bitboxMock } = require('./bitbox')

// Inspect JS Objects.
const util = require('util')
util.inspect.defaultOptions = {
  showHidden: true,
  colors: true
}

const slpMock = bitboxMock

const mockBalance = [
  {
    tokenId: '38e97c5d7d3585a2cbf3f9580c82ca33985f9cb0845d4dcce220cb709f9538b0',
    balance: '19882.09163133',
    decimalCount: 8
  }
]

slpMock.Utils = {
  balancesForAddress: sinon.stub().resolves(mockBalance)
}

module.exports = {
  slpMock
}
