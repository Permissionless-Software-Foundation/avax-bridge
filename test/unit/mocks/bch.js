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

const bchMockData = {
  addressDetails
}

module.exports = bchMockData
