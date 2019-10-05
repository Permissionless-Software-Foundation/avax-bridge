/*
  Constains mock data for unit tests of the transactions.js library.
*/

'use strict'

const mockTransactions = {
  'txid': 'af30cc46356378cb5f139fb9da301d3b06a50416eb5030e3d397d6c3c027a26d',
  'version': 2,
  'vin': [
    {
      'txid': '2829d3de54358bd0b9c6c84762c2614c3e9c3cb8955465f6eee2c0adf4fe5d2c',
      'sequence': 4294967295,
      'n': 0,
      'addresses': [
        'bchtest:qpyrwjq5c8euxyuwyqqdt40qf00dkfw02q6aqhm2wt'
      ],
      'value': '459621029',
      'hex': '483045022100c7ece8aad3e663f1fe17ed59749729bcd30caf0b9ef6e9f4a286be637f256d970220090ba000bf01ccb26eaa8a6397a5c19a507184aae50f4a0ebcb7c9847cf9f0154121020d01a18f138e0461e14fa3bac7913be2ad9e26b9a9fc4cfded431344ca2a0dcb'
    }
  ],
  'vout': [
    {
      'value': '459601773',
      'n': 0,
      'spent': true,
      'hex': '76a91448374814c1f3c3138e2000d5d5e04bdedb25cf5088ac',
      'addresses': [
        'bchtest:qpyrwjq5c8euxyuwyqqdt40qf00dkfw02q6aqhm2wt'
      ]
    },
    {
      'value': '10000',
      'n': 1,
      'hex': '76a91428e1f3653ca13dc8d2b8a1fe81046ba730e4666f88ac',
      'addresses': [
        'bchtest:qq5wrum98jsnmjxjhzslaqgydwnnperxduufpzceyh'
      ]
    }
  ],
  'blockHash': '00000000810872d327576bcd09ad36a4be113155cf20ab2d3d05481b83b519c7',
  'blockHeight': 1332233,
  'confirmations': 41,
  'blockTime': 1570211403,
  'value': '459611773',
  'valueIn': '459621029',
  'fees': '9256',
  'hex': '02000000012c5dfef4adc0e2eef6655495b83c9c3e4c61c26247c8c6b9d08b3554ded32928000000006b483045022100c7ece8aad3e663f1fe17ed59749729bcd30caf0b9ef6e9f4a286be637f256d970220090ba000bf01ccb26eaa8a6397a5c19a507184aae50f4a0ebcb7c9847cf9f0154121020d01a18f138e0461e14fa3bac7913be2ad9e26b9a9fc4cfded431344ca2a0dcbffffffff026df7641b000000001976a91448374814c1f3c3138e2000d5d5e04bdedb25cf5088ac10270000000000001976a91428e1f3653ca13dc8d2b8a1fe81046ba730e4666f88ac00000000'
}

const txMockData = {
  mockTransactions
}

module.exports = txMockData
