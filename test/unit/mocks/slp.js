/*
  Contains mock of SLP SDK, which extends the BITBOX SDK mock.
*/

'use strict'

// const sinon = require('sinon')
// const { bitboxMock } = require('./bitbox')

// Inspect JS Objects.
const util = require('util')
util.inspect.defaultOptions = {
  showHidden: true,
  colors: true
}
/*
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
*/

const txDetails = {
  'txid': '3f027a0006e28db49cfa24820d1cab67c3591e975791e46af689c319819bf8d0',
  'version': 2,
  'locktime': 0,
  'vin': [
    {
      'txid': '0289aa657b65ce5cd91f0a4fc0519809b14a25452e761fe9222304b0c361ae5d',
      'vout': 0,
      'sequence': 4294967295,
      'n': 0,
      'scriptSig': {
        'hex': '473044022066046b860e2f7380c0e06d7af04d889e885b639f62e370a69bcb3ed800caee1b022062e252d889c8e09d3cd559ef58e42548e9ac1ecbffd9728296aa18c71bc50bdc41210242faa7cc02f9e6c3a0aec97a946b9d3793fa6ab76362e02dd239bc56393671cd',
        'asm': '3044022066046b860e2f7380c0e06d7af04d889e885b639f62e370a69bcb3ed800caee1b022062e252d889c8e09d3cd559ef58e42548e9ac1ecbffd9728296aa18c71bc50bdc[ALL|FORKID] 0242faa7cc02f9e6c3a0aec97a946b9d3793fa6ab76362e02dd239bc56393671cd'
      },
      'value': 25756,
      'legacyAddress': '1GQTe9EdBaF4fCTC2esvPNXewkUZoytADL',
      'cashAddress': 'bitcoincash:qz50nvfs07jp9kn2jz0s3ycwtfgz6fa8fgmc5skpja'
    },
    {
      'txid': '8952079ec66e66fafa7042f665ceb97ef55d7d9ffc0f756b50e3e22373e6cffc',
      'vout': 3,
      'sequence': 4294967295,
      'n': 1,
      'scriptSig': {
        'hex': '483045022100ba3dc8ce2f9541161191077d85af5610f3f717dcdb008432e2d4d6773c19cbd602201e9e6c410a45767812c7dca77b245beb982b4d9a51dab181f88e9f65d57035fc41210242faa7cc02f9e6c3a0aec97a946b9d3793fa6ab76362e02dd239bc56393671cd',
        'asm': '3045022100ba3dc8ce2f9541161191077d85af5610f3f717dcdb008432e2d4d6773c19cbd602201e9e6c410a45767812c7dca77b245beb982b4d9a51dab181f88e9f65d57035fc[ALL|FORKID] 0242faa7cc02f9e6c3a0aec97a946b9d3793fa6ab76362e02dd239bc56393671cd'
      },
      'value': 33720594,
      'legacyAddress': '1GQTe9EdBaF4fCTC2esvPNXewkUZoytADL',
      'cashAddress': 'bitcoincash:qz50nvfs07jp9kn2jz0s3ycwtfgz6fa8fgmc5skpja'
    },
    {
      'txid': '8952079ec66e66fafa7042f665ceb97ef55d7d9ffc0f756b50e3e22373e6cffc',
      'vout': 2,
      'sequence': 4294967295,
      'n': 2,
      'scriptSig': {
        'hex': '47304402203e6ef3cd33e5084b3716d67995f4c31c72901bc09e63d0e55f774ec51ae89403022001bb3097910cd820eea4a435ce047c129e41068262e6e86789e4653d0540cddf41210242faa7cc02f9e6c3a0aec97a946b9d3793fa6ab76362e02dd239bc56393671cd',
        'asm': '304402203e6ef3cd33e5084b3716d67995f4c31c72901bc09e63d0e55f774ec51ae89403022001bb3097910cd820eea4a435ce047c129e41068262e6e86789e4653d0540cddf[ALL|FORKID] 0242faa7cc02f9e6c3a0aec97a946b9d3793fa6ab76362e02dd239bc56393671cd'
      },
      'value': 546,
      'legacyAddress': '1GQTe9EdBaF4fCTC2esvPNXewkUZoytADL',
      'cashAddress': 'bitcoincash:qz50nvfs07jp9kn2jz0s3ycwtfgz6fa8fgmc5skpja'
    }
  ],
  'vout': [
    {
      'value': '0.00000000',
      'n': 0,
      'scriptPubKey': {
        'hex': '6a04534c500001010453454e442038e97c5d7d3585a2cbf3f9580c82ca33985f9cb0845d4dcce220cb709f9538b0080000000005f5e1000800000000c67f476c',
        'asm': 'OP_RETURN 5262419 1 1145980243 38e97c5d7d3585a2cbf3f9580c82ca33985f9cb0845d4dcce220cb709f9538b0 0000000005f5e100 00000000c67f476c'
      },
      'spentTxId': null,
      'spentIndex': null,
      'spentHeight': null
    },
    {
      'value': '0.00000546',
      'n': 1,
      'scriptPubKey': {
        'hex': '76a914bfab3dcc6b696214b7cb9170350992a57c04134888ac',
        'asm': 'OP_DUP OP_HASH160 bfab3dcc6b696214b7cb9170350992a57c041348 OP_EQUALVERIFY OP_CHECKSIG',
        'addresses': [
          '1JUTChe9zwdRaKCA2NYpeap7WvrKhpaoru'
        ],
        'type': 'pubkeyhash'
      },
      'spentTxId': null,
      'spentIndex': null,
      'spentHeight': null
    },
    {
      'value': '0.00000546',
      'n': 2,
      'scriptPubKey': {
        'hex': '76a914a8f9b1307fa412da6a909f08930e5a502d27a74a88ac',
        'asm': 'OP_DUP OP_HASH160 a8f9b1307fa412da6a909f08930e5a502d27a74a OP_EQUALVERIFY OP_CHECKSIG',
        'addresses': [
          '1GQTe9EdBaF4fCTC2esvPNXewkUZoytADL'
        ],
        'type': 'pubkeyhash'
      },
      'spentTxId': null,
      'spentIndex': null,
      'spentHeight': null
    },
    {
      'value': '0.33745140',
      'n': 3,
      'scriptPubKey': {
        'hex': '76a914a8f9b1307fa412da6a909f08930e5a502d27a74a88ac',
        'asm': 'OP_DUP OP_HASH160 a8f9b1307fa412da6a909f08930e5a502d27a74a OP_EQUALVERIFY OP_CHECKSIG',
        'addresses': [
          '1GQTe9EdBaF4fCTC2esvPNXewkUZoytADL'
        ],
        'type': 'pubkeyhash'
      },
      'spentTxId': null,
      'spentIndex': null,
      'spentHeight': null
    }
  ],
  'blockhash': '00000000000000000432104f41a7710d6e620221b77aa734b37b8c33605fc14c',
  'blockheight': 575386,
  'confirmations': 1,
  'time': 1553552734,
  'blocktime': 1553552734,
  'valueOut': 0.33746232,
  'size': 627,
  'valueIn': 0.33746896,
  'fees': 0.00000664,
  'tokenInfo': {
    'versionType': 1,
    'transactionType': 'SEND',
    'tokenIdHex': '38e97c5d7d3585a2cbf3f9580c82ca33985f9cb0845d4dcce220cb709f9538b0',
    'sendOutputs': [
      '0',
      '100000000',
      '3330230124'
    ]
  },
  'tokenIsValid': true
}

const slpMockData = {
  txDetails
}

module.exports = slpMockData
