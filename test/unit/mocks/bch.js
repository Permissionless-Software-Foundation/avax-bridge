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

const getTxOutValid = {
  bestblock: '000000000012d5d3818d15496b177d7cf94704c40e9f5419186b00864d0b573c',
  confirmations: 3,
  value: 12.04311016,
  scriptPubKey: {
    asm:
      'OP_DUP OP_HASH160 454be45106c439c84d4f1f15a7c90eb1d78ff0e8 OP_EQUALVERIFY OP_CHECKSIG',
    hex: '76a914454be45106c439c84d4f1f15a7c90eb1d78ff0e888ac',
    reqSigs: 1,
    type: 'pubkeyhash',
    addresses: ['bchtest:qpz5hez3qmzrnjzdfu03tf7fp6ca0rlsaqvrxmfpyd']
  },
  coinbase: false
}

const burnOpReturnTx = {
  txid: '73e0b24ab94413c8bf003168c533653b91c9409218cf4ed601b77734856770d1',
  hash: '73e0b24ab94413c8bf003168c533653b91c9409218cf4ed601b77734856770d1',
  version: 2,
  size: 212,
  locktime: 0,
  vin: [
    {
      txid: '78fe08930a33fb5b7c7ab6dd9c7698d28c8c8773332713d987ee87cdbb817af8',
      vout: 0,
      scriptSig: {
        asm:
          '304402204c866925f05a788e2feafe2ccce4dc0509380e5c8c89f75fb7341b0d08917ed502200e16378c21231db0be7b0e0510f3fd8d1e57e40bedf82be51c8b97dfd96d6ff1[ALL|FORKID] 033467a695b2712127c2fad51a92d892b8698a58ae09a16cf37bbff0becbbc4f50',
        hex:
          '47304402204c866925f05a788e2feafe2ccce4dc0509380e5c8c89f75fb7341b0d08917ed502200e16378c21231db0be7b0e0510f3fd8d1e57e40bedf82be51c8b97dfd96d6ff14121033467a695b2712127c2fad51a92d892b8698a58ae09a16cf37bbff0becbbc4f50'
      },
      sequence: 4294967295
    }
  ],
  vout: [
    {
      value: 0,
      n: 0,
      scriptPubKey: {
        asm: 'OP_RETURN 621 4255524e203130',
        hex: '6a026d02074255524e203130',
        type: 'nulldata'
      }
    },
    {
      value: 0.000095,
      n: 1,
      scriptPubKey: {
        asm:
          'OP_DUP OP_HASH160 caf35e1619cba2f477041f2455e68a96cb98ef82 OP_EQUALVERIFY OP_CHECKSIG',
        hex: '76a914caf35e1619cba2f477041f2455e68a96cb98ef8288ac',
        reqSigs: 1,
        type: 'pubkeyhash',
        addresses: ['bchtest:qr90xhskr8969arhqs0jg40x32tvhx80sgwk63hwq3']
      }
    }
  ],
  hex:
    '0200000001f87a81bbcd87ee87d913273373878c8cd298769cddb67a7c5bfb330a9308fe78000000006a47304402204c866925f05a788e2feafe2ccce4dc0509380e5c8c89f75fb7341b0d08917ed502200e16378c21231db0be7b0e0510f3fd8d1e57e40bedf82be51c8b97dfd96d6ff14121033467a695b2712127c2fad51a92d892b8698a58ae09a16cf37bbff0becbbc4f50ffffffff0200000000000000000c6a026d02074255524e2031301c250000000000001976a914caf35e1619cba2f477041f2455e68a96cb98ef8288ac00000000',
  blockhash: '0000000012ae7df177800a2fbf6256c1946729f7d98cbb97a322094e9cc3d995',
  confirmations: 2,
  time: 1577234056,
  blocktime: 1577234056
}

const bchMockData = {
  balance,
  utxos,
  txDetails,
  getTxOutValid,
  burnOpReturnTx
}

module.exports = bchMockData
