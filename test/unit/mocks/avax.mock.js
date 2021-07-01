const avalanche = require('avalanche')
const { BN, BinTools } = avalanche
const avm = require('avalanche/dist/apis/avm')
const binTools = BinTools.getInstance()

const avax = new avalanche.Avalanche('AVAX_IP', 9650)
const xchain = avax.XChain()

const senderAddress = 'X-avax1dcv9jg4x9z3drxxkgjs70eh0lgff9qyymq7wx8'

const fakeConfig = {
  AVAX_IP: 'localhost',
  AVAX_PORT: '4650',
  AVAX_PRIVATE_KEY:
    'PrivateKey-kXESwYRt4TkPXG4A9EXx1pXqP2aMUcGYTBpAGZxuKjyCwvVP',
  AVAX_TOKEN_ID: '2jgTFB6MM4vwLzUNWFYGPfyeQfpLaEqj4XWku6FoW7vaGrrEd5',
  AVAX_ADDR: 'X-avax1d73xzy6tqchgxrdr0um3hjae0qzpyvp2x5j9as'
}

const avaxString = 'FvwEAhmxKfeiG8SnEvq42hc6whRyY3EFYAvebMqDNDGCgxN5Z'
const avaxID = binTools.cb58Decode(avaxString)
const assetId = binTools.cb58Decode(fakeConfig.AVAX_TOKEN_ID)

const addresses = [xchain.parseAddress(fakeConfig.AVAX_ADDR)]

const transactions = [
  {
    id: '2tEi6r6PZ9VXHogUmkCzvijmW81TRNjtKWnR4FA55zTPc87fxC',
    chainID: '2oYMBNV4eNHyqk2fjjV5nVQLDbtmNJzq5s3qs3Lo6ftnC6FByM',
    type: 'operation',
    acceptedAt: '2021-03-24T23:56:13.328Z',
    inputs: [
      {
        output: {
          id: '2uWp4MeXZiwECx2wH3Aig43BHiydBdSSTGBLHYZPSD5E8WT1sj',
          transactionID: 'sBCUA6c7NY1jDRgb24R2K7zKQT7FxVZpWtSRazt92ozZRpJRB',
          assetID: 'FvwEAhmxKfeiG8SnEvq42hc6whRyY3EFYAvebMqDNDGCgxN5Z',
          amount: '100000000',
          addresses: ['avax150agl543yn0n5z9z20tgmrggs8fc2ckkma4qfv']
        }
      }
    ],
    outputs: [
      {
        id: 'QGFmhRGYHNbWMLhEVqMTTUcbXa7N6zGHnr4weQNKPaDkYpqNY',
        transactionID: '2tEi6r6PZ9VXHogUmkCzvijmW81TRNjtKWnR4FA55zTPc87fxC',
        assetID: 'FvwEAhmxKfeiG8SnEvq42hc6whRyY3EFYAvebMqDNDGCgxN5Z',
        outputType: 7,
        amount: '90000000',
        addresses: ['avax150agl543yn0n5z9z20tgmrggs8fc2ckkma4qfv']
      },
      {
        id: 'rW4yn7BgdEznfbzfJXmBB2RFKwCYZS2TR72gjw9Tx78cdPM9C',
        transactionID: '2tEi6r6PZ9VXHogUmkCzvijmW81TRNjtKWnR4FA55zTPc87fxC',
        assetID: '2tEi6r6PZ9VXHogUmkCzvijmW81TRNjtKWnR4FA55zTPc87fxC',
        outputType: 6,
        amount: '1',
        addresses: ['avax150agl543yn0n5z9z20tgmrggs8fc2ckkma4qfv']
      },
      {
        id: 'FE5p8PxHpkHwyg7QvWzTDHBmVyvuN1cYtX8JLnPofD6zTdjFq',
        transactionID: '2tEi6r6PZ9VXHogUmkCzvijmW81TRNjtKWnR4FA55zTPc87fxC',
        assetID: '2tEi6r6PZ9VXHogUmkCzvijmW81TRNjtKWnR4FA55zTPc87fxC',
        outputType: 7,
        amount: '100',
        addresses: ['avax150agl543yn0n5z9z20tgmrggs8fc2ckkma4qfv']
      }
    ]
  },
  {
    id: '2st8315DNQkSY4cAEfdHGC7BW7myvK3yXretSjuHXEV8oCv8AG',
    chainID: '2oYMBNV4eNHyqk2fjjV5nVQLDbtmNJzq5s3qs3Lo6ftnC6FByM',
    type: 'X_BASE_TRANSACTION',
    acceptedAt: '2021-04-01T03:21:03.112Z',
    memo: null,
    inputs: [
      {
        output: {
          id: 'c5pHB1fkdW2R9dyULPThafDCPsycjEMbFFDHRssQNaGe9krpr',
          transactionID: 'Byo1Brzg5Sg9p73o2Mv5Yd2P5GPJLYetMWVtwSL2j3AHVkRAA',
          assetID: 'FvwEAhmxKfeiG8SnEvq42hc6whRyY3EFYAvebMqDNDGCgxN5Z',
          amount: '1000000',
          addresses: ['avax1xasw9kra42luktrckgc8z3hsgzme7h4ck6r4s9']
        }
      },
      {
        output: {
          id: '2n9VoKT5ihnz3VNEd3sKhExeHWP9iEKrknN8eKYQnH9eF3bsmw',
          transactionID: 'ZpijU3ujGz5bgzhRwnbEivdtHYQ1sKWXTKfHH5WCTNQkM3emk',
          assetID: 'FvwEAhmxKfeiG8SnEvq42hc6whRyY3EFYAvebMqDNDGCgxN5Z',
          amount: '84000000',
          addresses: ['avax1xasw9kra42luktrckgc8z3hsgzme7h4ck6r4s9']
        }
      }
    ],
    outputs: [
      {
        id: 'eYfVtuFUNvtNN3ro3SWTfwRiRKmok82Ce2hYd8N9N1n9vabCw',
        transactionID: '2st8315DNQkSY4cAEfdHGC7BW7myvK3yXretSjuHXEV8oCv8AG',
        assetID: 'FvwEAhmxKfeiG8SnEvq42hc6whRyY3EFYAvebMqDNDGCgxN5Z',
        outputType: 7,
        amount: '1000000',
        addresses: ['avax150agl543yn0n5z9z20tgmrggs8fc2ckkma4qfv']
      },
      {
        id: '21aeW38LP5ri9aik4Xvsv8i227gMVbsHnxYMzAnXdrMZ7X9sDF',
        transactionID: '2st8315DNQkSY4cAEfdHGC7BW7myvK3yXretSjuHXEV8oCv8AG',
        assetID: 'FvwEAhmxKfeiG8SnEvq42hc6whRyY3EFYAvebMqDNDGCgxN5Z',
        outputType: 7,
        amount: '83000000',
        addresses: ['avax1xasw9kra42luktrckgc8z3hsgzme7h4ck6r4s9']
      }
    ]
  },
  {
    id: '2FznNpHKf5MkTaY7nSCJYr599rga8m5vEhAHFzSQvgZqQcc38R',
    chainID: '2oYMBNV4eNHyqk2fjjV5nVQLDbtmNJzq5s3qs3Lo6ftnC6FByM',
    type: 'base',
    acceptedAt: '2021-04-02T02:02:18.738Z',
    memo: 'ABJTY3JpcHQgdG8gbWludCBBTlQ=',
    inputs: [
      {
        output: {
          id: 'QGFmhRGYHNbWMLhEVqMTTUcbXa7N6zGHnr4weQNKPaDkYpqNY',
          transactionID: '2tEi6r6PZ9VXHogUmkCzvijmW81TRNjtKWnR4FA55zTPc87fxC',
          assetID: 'FvwEAhmxKfeiG8SnEvq42hc6whRyY3EFYAvebMqDNDGCgxN5Z',
          amount: '90000000',
          addresses: ['avax150agl543yn0n5z9z20tgmrggs8fc2ckkma4qfv']
        }
      },
      {
        output: {
          id: 'rW4yn7BgdEznfbzfJXmBB2RFKwCYZS2TR72gjw9Tx78cdPM9C',
          transactionID: '2tEi6r6PZ9VXHogUmkCzvijmW81TRNjtKWnR4FA55zTPc87fxC',
          assetID: '2tEi6r6PZ9VXHogUmkCzvijmW81TRNjtKWnR4FA55zTPc87fxC',
          amount: '1',
          addresses: ['avax150agl543yn0n5z9z20tgmrggs8fc2ckkma4qfv']
        }
      }
    ],
    outputs: [
      {
        id: '2pYGGiAu4RyF94JTfBPexvWuKQsbBKFBocfFroR3GM8w1H2ou9',
        transactionID: '2FznNpHKf5MkTaY7nSCJYr599rga8m5vEhAHFzSQvgZqQcc38R',
        assetID: 'FvwEAhmxKfeiG8SnEvq42hc6whRyY3EFYAvebMqDNDGCgxN5Z',
        outputType: 7,
        amount: '89000000',
        addresses: ['avax150agl543yn0n5z9z20tgmrggs8fc2ckkma4qfv']
      },
      {
        id: 'gpW3AtnmNNRKqcbcS4ZHguvT5JG2QJKaUHGvRHwzFusPyFq8C',
        transactionID: '2FznNpHKf5MkTaY7nSCJYr599rga8m5vEhAHFzSQvgZqQcc38R',
        assetID: '2tEi6r6PZ9VXHogUmkCzvijmW81TRNjtKWnR4FA55zTPc87fxC',
        outputType: 6,
        amount: '1',
        addresses: ['avax150agl543yn0n5z9z20tgmrggs8fc2ckkma4qfv']
      },
      {
        id: '2eznNoGo32invTUMpmFfCMvQMF1STWj9nwtiyjzGJwSW9Ykmbu',
        transactionID: '2FznNpHKf5MkTaY7nSCJYr599rga8m5vEhAHFzSQvgZqQcc38R',
        assetID: '2tEi6r6PZ9VXHogUmkCzvijmW81TRNjtKWnR4FA55zTPc87fxC',
        outputType: 7,
        amount: '1000',
        addresses: ['avax150agl543yn0n5z9z20tgmrggs8fc2ckkma4qfv']
      }
    ]
  },
  {
    id: '2MSyPCcB6Bz2sqxsifCJnVNVTFrHW4D4gFRa6LeRkgEwgRjLkC',
    chainID: '2oYMBNV4eNHyqk2fjjV5nVQLDbtmNJzq5s3qs3Lo6ftnC6FByM',
    type: 'base',
    acceptedAt: '2021-04-02T02:13:27.376Z',
    memo: 'ABJTY3JpcHQgdG8gbWludCBBTlQ=',
    inputs: [
      {
        output: {
          id: 'eYfVtuFUNvtNN3ro3SWTfwRiRKmok82Ce2hYd8N9N1n9vabCw',
          transactionID: '2st8315DNQkSY4cAEfdHGC7BW7myvK3yXretSjuHXEV8oCv8AG',
          assetID: 'FvwEAhmxKfeiG8SnEvq42hc6whRyY3EFYAvebMqDNDGCgxN5Z',
          amount: '1000000',
          addresses: ['avax150agl543yn0n5z9z20tgmrggs8fc2ckkma4qfv']
        }
      },
      {
        output: {
          id: 'gpW3AtnmNNRKqcbcS4ZHguvT5JG2QJKaUHGvRHwzFusPyFq8C',
          transactionID: '2FznNpHKf5MkTaY7nSCJYr599rga8m5vEhAHFzSQvgZqQcc38R',
          assetID: '2tEi6r6PZ9VXHogUmkCzvijmW81TRNjtKWnR4FA55zTPc87fxC',
          amount: '1',
          addresses: ['avax150agl543yn0n5z9z20tgmrggs8fc2ckkma4qfv']
        }
      }
    ],
    outputs: [
      {
        id: 'XUVTMWmcxVxj55Vwar6RXcTwLPdh8Lgpk4BKwBNKjAd3abPrk',
        transactionID: '2MSyPCcB6Bz2sqxsifCJnVNVTFrHW4D4gFRa6LeRkgEwgRjLkC',
        assetID: '2tEi6r6PZ9VXHogUmkCzvijmW81TRNjtKWnR4FA55zTPc87fxC',
        outputType: 6,
        amount: '1',
        addresses: ['avax150agl543yn0n5z9z20tgmrggs8fc2ckkma4qfv']
      },
      {
        id: '2UWicCfoXfsfxZQECiSxg8oTh1v8fj4EK6aJ1yNtEpkWJfYK6i',
        transactionID: '2MSyPCcB6Bz2sqxsifCJnVNVTFrHW4D4gFRa6LeRkgEwgRjLkC',
        assetID: '2tEi6r6PZ9VXHogUmkCzvijmW81TRNjtKWnR4FA55zTPc87fxC',
        addresses: ['avax1xasw9kra42luktrckgc8z3hsgzme7h4ck6r4s9'],
        outputType: 7,
        amount: '100'
      }
    ]
  },
  {
    id: 'dcJHY4aUHboSVhqNtDcw2SNaufLkgLZARNkAioYC1gh6nWpPF',
    chainID: '2oYMBNV4eNHyqk2fjjV5nVQLDbtmNJzq5s3qs3Lo6ftnC6FByM',
    type: 'base',
    acceptedAt: '2021-04-02T02:19:54.680Z',
    memo: 'QkNIIGJpdGNvaW5jYXNoOnF6bnAwbmVrZ21haGtxd3Y1NHp2cTQzM3RteGVydHdzNXN3Z3gybmNkaA==',
    inputs: [
      {
        output: {
          id: '2UWicCfoXfsfxZQECiSxg8oTh1v8fj4EK6aJ1yNtEpkWJfYK6i',
          transactionID: '2MSyPCcB6Bz2sqxsifCJnVNVTFrHW4D4gFRa6LeRkgEwgRjLkC',
          assetID: '2tEi6r6PZ9VXHogUmkCzvijmW81TRNjtKWnR4FA55zTPc87fxC',
          amount: '100',
          addresses: ['avax1xasw9kra42luktrckgc8z3hsgzme7h4ck6r4s9']
        }
      },
      {
        output: {
          id: '21aeW38LP5ri9aik4Xvsv8i227gMVbsHnxYMzAnXdrMZ7X9sDF',
          transactionID: '2st8315DNQkSY4cAEfdHGC7BW7myvK3yXretSjuHXEV8oCv8AG',
          assetID: 'FvwEAhmxKfeiG8SnEvq42hc6whRyY3EFYAvebMqDNDGCgxN5Z',
          amount: '83000000',
          addresses: ['avax1xasw9kra42luktrckgc8z3hsgzme7h4ck6r4s9']
        }
      }
    ],
    outputs: [
      {
        id: '2cWYBQzsCnwCzXv3tgDjyB3jrzGfTPnAhEY9HLvaQdbZHEmuFh',
        transactionID: 'dcJHY4aUHboSVhqNtDcw2SNaufLkgLZARNkAioYC1gh6nWpPF',
        assetID: 'FvwEAhmxKfeiG8SnEvq42hc6whRyY3EFYAvebMqDNDGCgxN5Z',
        outputType: 7,
        amount: '82000000',
        addresses: ['avax1xasw9kra42luktrckgc8z3hsgzme7h4ck6r4s9']
      },
      {
        id: '2niNWsF2FmzKCMpRobkHR5c7BU3MoyqUQDa1aw9Lm5FAWnECWU',
        transactionID: 'dcJHY4aUHboSVhqNtDcw2SNaufLkgLZARNkAioYC1gh6nWpPF',
        assetID: '2tEi6r6PZ9VXHogUmkCzvijmW81TRNjtKWnR4FA55zTPc87fxC',
        outputType: 7,
        amount: '100',
        addresses: ['avax150agl543yn0n5z9z20tgmrggs8fc2ckkma4qfv']
      }
    ]
  }
]

const assetDescription = {
  denomination: 2
}

const base64Memo = 'QkNIIGJpdGNvaW5jYXNoOnF6bnAwbmVrZ21haGtxd3Y1NHp2cTQzM3RteGVydHdzNXN3Z3gybmNkaA=='
const invalidMemo = 'U2NyaXB0IHRvIG1pbnQgQU5U'

const knownTxids = [
  '2tEi6r6PZ9VXHogUmkCzvijmW81TRNjtKWnR4FA55zTPc87fxC',
  '2st8315DNQkSY4cAEfdHGC7BW7myvK3yXretSjuHXEV8oCv8AG',
  '2FznNpHKf5MkTaY7nSCJYr599rga8m5vEhAHFzSQvgZqQcc38R',
  '2MSyPCcB6Bz2sqxsifCJnVNVTFrHW4D4gFRa6LeRkgEwgRjLkC',
  'dcJHY4aUHboSVhqNtDcw2SNaufLkgLZARNkAioYC1gh6nWpPF'
]

const formatedSelfTx = {
  id: '2MSyPCcB6Bz2sqxsifCJnVNVTFrHW4D4gFRa6LeRkgEwgRjLkC',
  memo: 'ABJTY3JpcHQgdG8gbWludCBBTlQ=',
  inputs: [
    {
      id: 'eYfVtuFUNvtNN3ro3SWTfwRiRKmok82Ce2hYd8N9N1n9vabCw',
      txid: '2st8315DNQkSY4cAEfdHGC7BW7myvK3yXretSjuHXEV8oCv8AG',
      assetID: 'FvwEAhmxKfeiG8SnEvq42hc6whRyY3EFYAvebMqDNDGCgxN5Z',
      addresses: ['avax150agl543yn0n5z9z20tgmrggs8fc2ckkma4qfv'],
      amount: 1000000,
      isValidAsset: true,
      isUserAddress: true
    },
    {
      id: 'gpW3AtnmNNRKqcbcS4ZHguvT5JG2QJKaUHGvRHwzFusPyFq8C',
      txid: '2FznNpHKf5MkTaY7nSCJYr599rga8m5vEhAHFzSQvgZqQcc38R',
      assetID: '2tEi6r6PZ9VXHogUmkCzvijmW81TRNjtKWnR4FA55zTPc87fxC',
      addresses: ['avax150agl543yn0n5z9z20tgmrggs8fc2ckkma4qfv'],
      amount: 1,
      isValidAsset: true,
      isUserAddress: true
    }
  ],
  outputs: [
    {
      id: 'XUVTMWmcxVxj55Vwar6RXcTwLPdh8Lgpk4BKwBNKjAd3abPrk',
      txid: '2MSyPCcB6Bz2sqxsifCJnVNVTFrHW4D4gFRa6LeRkgEwgRjLkC',
      assetID: '2tEi6r6PZ9VXHogUmkCzvijmW81TRNjtKWnR4FA55zTPc87fxC',
      addresses: ['avax150agl543yn0n5z9z20tgmrggs8fc2ckkma4qfv'],
      outputType: 6,
      amount: 1,
      isValidAsset: true,
      isUserAddress: true
    },
    {
      id: '2UWicCfoXfsfxZQECiSxg8oTh1v8fj4EK6aJ1yNtEpkWJfYK6i',
      txid: '2MSyPCcB6Bz2sqxsifCJnVNVTFrHW4D4gFRa6LeRkgEwgRjLkC',
      assetID: '2tEi6r6PZ9VXHogUmkCzvijmW81TRNjtKWnR4FA55zTPc87fxC',
      addresses: ['avax150agl543yn0n5z9z20tgmrggs8fc2ckkma4qfv'],
      outputType: 7,
      amount: 100,
      isValidAsset: true,
      isUserAddress: true
    }
  ]
}

const formatedTx = {
  id: 'dcJHY4aUHboSVhqNtDcw2SNaufLkgLZARNkAioYC1gh6nWpPF',
  memo: 'QkNIIGJpdGNvaW5jYXNoOnF6bnAwbmVrZ21haGtxd3Y1NHp2cTQzM3RteGVydHdzNXN3Z3gybmNkaA==',
  inputs: [
    {
      id: '2UWicCfoXfsfxZQECiSxg8oTh1v8fj4EK6aJ1yNtEpkWJfYK6i',
      txid: '2MSyPCcB6Bz2sqxsifCJnVNVTFrHW4D4gFRa6LeRkgEwgRjLkC',
      assetID: '2tEi6r6PZ9VXHogUmkCzvijmW81TRNjtKWnR4FA55zTPc87fxC',
      addresses: ['avax1xasw9kra42luktrckgc8z3hsgzme7h4ck6r4s9'],
      amount: 100,
      isValidAsset: true,
      isUserAddress: false
    },
    {
      id: '21aeW38LP5ri9aik4Xvsv8i227gMVbsHnxYMzAnXdrMZ7X9sDF',
      txid: '2st8315DNQkSY4cAEfdHGC7BW7myvK3yXretSjuHXEV8oCv8AG',
      assetID: 'FvwEAhmxKfeiG8SnEvq42hc6whRyY3EFYAvebMqDNDGCgxN5Z',
      addresses: ['avax1xasw9kra42luktrckgc8z3hsgzme7h4ck6r4s9'],
      amount: 83000000,
      isValidAsset: false,
      isUserAddress: false
    }
  ],
  outputs: [
    {
      id: '2cWYBQzsCnwCzXv3tgDjyB3jrzGfTPnAhEY9HLvaQdbZHEmuFh',
      txid: 'dcJHY4aUHboSVhqNtDcw2SNaufLkgLZARNkAioYC1gh6nWpPF',
      assetID: 'FvwEAhmxKfeiG8SnEvq42hc6whRyY3EFYAvebMqDNDGCgxN5Z',
      addresses: ['avax1dcv9jg4x9z3drxxkgjs70eh0lgff9qyymq7wx8'],
      outputType: 7,
      amount: 82000000,
      isValidAsset: false,
      isUserAddress: false
    },
    {
      id: '2niNWsF2FmzKCMpRobkHR5c7BU3MoyqUQDa1aw9Lm5FAWnECWU',
      txid: 'dcJHY4aUHboSVhqNtDcw2SNaufLkgLZARNkAioYC1gh6nWpPF',
      assetID: '2tEi6r6PZ9VXHogUmkCzvijmW81TRNjtKWnR4FA55zTPc87fxC',
      addresses: ['avax150agl543yn0n5z9z20tgmrggs8fc2ckkma4qfv'],
      outputType: 7,
      amount: 100,
      isValidAsset: true,
      isUserAddress: true
    }
  ]
}

// UTXOS and UTXOSets
const emptyUTXOSet = new avm.UTXOSet()

const codecID = binTools.fromBNToBuffer(new BN(0))

const UTXOWithoutFee = new avm.UTXOSet()
const smallUTXO = new avm.UTXO(
  codecID,
  binTools.cb58Decode('2TKfT1LrPbHYLdjiZYXRfLJ2L7yeELSyGykBikMji3mP92oW1h'),
  binTools.cb58Decode('1111XiaYg'),
  avaxID,
  new avm.SECPTransferOutput(new BN(200), addresses)
)
UTXOWithoutFee.add(smallUTXO)

const UTXOWithoutToken = new avm.UTXOSet()
const UTXOwithFounds = new avm.UTXO(
  codecID,
  binTools.cb58Decode('2TKfT1LrPbHYLdjiZYXRfLJ2L7yeELSyGykBikMji3mP92oW1h'),
  binTools.cb58Decode('1111XiaYg'),
  avaxID,
  new avm.SECPTransferOutput(new BN(10000000000), addresses)
)
UTXOWithoutToken.add(UTXOwithFounds)

const UTXOWithToken = new avm.UTXOSet()
const UTXOToken = new avm.UTXO(
  codecID,
  binTools.cb58Decode('2TKfT1LrPbHYLdjiZYXRfLJ2L7yeELSyGykBikMji3mP92oW1h'),
  binTools.cb58Decode('111KgrGRw'),
  assetId,
  new avm.SECPTransferOutput(new BN(50), addresses)
)
const UTXOMintToken = new avm.UTXO(
  codecID,
  binTools.cb58Decode('2TKfT1LrPbHYLdjiZYXRfLJ2L7yeELSyGykBikMji3mP92oW1h'),
  binTools.cb58Decode('111AZw1it'),
  assetId,
  new avm.SECPMintOutput(addresses)
)
UTXOWithToken.add(UTXOwithFounds)
UTXOWithToken.add(UTXOMintToken)
UTXOWithToken.add(UTXOToken)

module.exports = {
  transactions,
  knownTxids,
  formatedTx,
  assetDescription,
  formatedSelfTx,
  invalidMemo,
  base64Memo,
  fakeConfig,
  emptyUTXOSet,
  UTXOWithoutToken,
  UTXOWithoutFee,
  avaxString,
  avaxID,
  addresses,
  assetId,
  UTXOWithToken,
  senderAddress
}
