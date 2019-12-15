/*
  Contains unit test mocking data for testing the bch.js library.
*/

'use strict'

const balance = {
  page: 1,
  totalPages: 1,
  itemsOnPage: 1000,
  address: 'bchtest:qz4qnxcxwvmacgye8wlakhz0835x0w3vtvaga95c09',
  balance: '1169995970',
  totalReceived: '1219987524',
  totalSent: '49991554',
  unconfirmedBalance: '0',
  unconfirmedTxs: 0,
  txs: 7,
  txids: ['9ee0226fe0162f3361fc9c549520157297daf902d986840d19bd3f90e6ae4698']
}

const utxos = [
  // {
  //   txid: '44b61963a5cc4485a3f37c1257af94e51d8a6ee78c6a850d82a240317914c622',
  //   vout: 0,
  //   amount: 5.48330146,
  //   satoshis: 548330146,
  //   height: 1279681,
  //   confirmations: 16277
  // },
  // {
  //   txid: 'e038c8e519ee465864cc26ba83026a58e2856095809d64db98ffd9b76537b7ea',
  //   vout: 0,
  //   amount: 0.01,
  //   satoshis: 1000000,
  //   height: 1279680,
  //   confirmations: 16278
  // },
  // {
  //   txid: '67e9bf196362e00325d2ac458204a33c23f55651e2956647bc357ce2e67f7006',
  //   vout: 0,
  //   amount: 0.01,
  //   satoshis: 1000000,
  //   height: 1275999,
  //   confirmations: 19959
  // }

  {
    txid: '50f031874a872249ca92a883b2460fabe19367710c05948f8f58f02fa81c0bca',
    vout: 2,
    value: '546',
    confirmations: 0,
    satoshis: 546
  },
  {
    txid: '50f031874a872249ca92a883b2460fabe19367710c05948f8f58f02fa81c0bca',
    vout: 3,
    value: '33779',
    confirmations: 0,
    satoshis: 33779
  }
]

const txDetails = {
  txid: 'ed4692f50a4553527dd26cd8674ca06a0ab2d366f3135ca3668310467ead3cbf',
  version: 2,
  vin: [
    {
      txid: '608723cd999f0eeed599763dde5686e0ee853c21f28428e01b088ec86a6deef5',
      vout: 1,
      sequence: 4294967295,
      n: 0,
      addresses: ['bchtest:qrwmj3nlcrfajhjcfza2ya939vv0stddgc0kknu6my'],
      value: '10000000',
      hex:
        '483045022100f1179e212430284fd164cd8aeac78270d2f4d82a401e9dd306fb1027a79152f8022046b10900ae517f22e6dbd5418b70e04313f7e7b7d7bba38bcb0509a6e734cdaa412103991b899172d3e509d2e58c5077b9fb6deabfb88696d06f318a9a8dbc147678b6'
    }
  ],
  vout: [
    {
      value: '1000',
      n: 0,
      hex: '76a914d9354d4a3f7b129b81c38b273db14c8fd31ac4d588ac',
      addresses: ['bchtest:qrvn2n228aa39xupcw9jw0d3fj8axxky656e4j62z2']
    },
    {
      value: '9998752',
      n: 1,
      spent: true,
      hex: '76a91459435560414151ed898e27df12542b6097146a3988ac',
      addresses: ['bchtest:qpv5x4tqg9q4rmvf3cna7yj59dsfw9r28yxe6gn2j9']
    }
  ],
  blockHash: '00000000385cb53a282d23895f655c0ade44ea906e41b6e4de5922644ffc1d4c',
  blockHeight: 1331145,
  confirmations: 288,
  blockTime: 1569628331,
  value: '9999752',
  valueIn: '10000000',
  fees: '248',
  hex:
    '0200000001f5ee6d6ac88e081be02884f2213c85eee08656de3d7699d5ee0e9f99cd238760010000006b483045022100f1179e212430284fd164cd8aeac78270d2f4d82a401e9dd306fb1027a79152f8022046b10900ae517f22e6dbd5418b70e04313f7e7b7d7bba38bcb0509a6e734cdaa412103991b899172d3e509d2e58c5077b9fb6deabfb88696d06f318a9a8dbc147678b6ffffffff02e8030000000000001976a914d9354d4a3f7b129b81c38b273db14c8fd31ac4d588aca0919800000000001976a91459435560414151ed898e27df12542b6097146a3988ac00000000'
}

const bchMockData = {
  balance,
  utxos,
  txDetails
}

module.exports = bchMockData
