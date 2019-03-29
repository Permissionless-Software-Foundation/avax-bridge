/*
  Contains unit test mocking data for testing the bch.js library.
*/

'use strict'

const addressDetails = {
  'balance': 0.49930837,
  'balanceSat': 49930837,
  'totalReceived': 29.97713114,
  'totalReceivedSat': 2997713114,
  'totalSent': 29.47782277,
  'totalSentSat': 2947782277,
  'unconfirmedBalance': 0,
  'unconfirmedBalanceSat': 0,
  'unconfirmedTxApperances': 0,
  'txApperances': 4,
  'transactions': [
    'f60f95dbb57917f49aa379efdbf8a7736ae81b6bbfa188425df455cdd24f0ed0',
    '4808c00b6ad7be430c9d32b5a6feca423894dc76c64a4401e42eaf4edaf9af10',
    'dd190d6b0ded3cabadabbd773a2ace83287978b8f703e510dfef9d02f1e71913',
    'bc22cfffc619d1470a0f2b84ba5e10331942670b29349bfc769e27c1ffab525e'
  ],
  'legacyAddress': 'mhQ4BtyJqFqtjRJAPHbDVVKc8bF63usAt6',
  'cashAddress': 'bchtest:qq22ys5qz8z4jzkkex7p5jrdd9vh6q06cgrpsx2fu7',
  'currentPage': 0,
  'pagesTotal': 1
}

const utxos = {
  'utxos': [
    {
      'txid': '44b61963a5cc4485a3f37c1257af94e51d8a6ee78c6a850d82a240317914c622',
      'vout': 0,
      'amount': 5.48330146,
      'satoshis': 548330146,
      'height': 1279681,
      'confirmations': 16277
    },
    {
      'txid': 'e038c8e519ee465864cc26ba83026a58e2856095809d64db98ffd9b76537b7ea',
      'vout': 0,
      'amount': 0.01,
      'satoshis': 1000000,
      'height': 1279680,
      'confirmations': 16278
    },
    {
      'txid': '67e9bf196362e00325d2ac458204a33c23f55651e2956647bc357ce2e67f7006',
      'vout': 0,
      'amount': 0.01,
      'satoshis': 1000000,
      'height': 1275999,
      'confirmations': 19959
    }
  ],
  'legacyAddress': 'mgscFRQyQAFpmxDjp1FGX7ALhGa11iqMbU',
  'cashAddress': 'bchtest:qq8wqgxq0uu4y6k92pw9f7s6hxzfp9umsvtg39pzqf',
  'scriptPubKey': '76a9140ee020c07f39526ac5505c54fa1ab98490979b8388ac'
}

const bchMockData = {
  addressDetails,
  utxos
}

module.exports = bchMockData
