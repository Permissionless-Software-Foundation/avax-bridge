// Establish the network, default to 'mainnet'
// const NETWORK = process.env.NETWORK ? process.env.NETWORK : `mainnet`
const NETWORK = process.env.NETWORK ? process.env.NETWORK : 'testnet'

let configOut = {}

if (NETWORK === 'mainnet') {
  // // Normal mainnet wallet.
  // configOut = {
  //   NETWORK: 'mainnet',
  //   port: process.env.PORT || 5000,
  //   BCH_ADDR: 'bitcoincash:qrnn49rx0p4xh78tts79utf0zv26vyru6vqtl9trd3',
  //   SLP_ADDR: 'simpleledger:qzhrpmu7nruyfcemeanqh5leuqcnf6zkjqems7xqf3',
  //   TOKENS_QTY_ORIGINAL: 50000,
  //   BCH_QTY_ORIGINAL: 250,
  //   SLP_TOKEN_ID:
  //     '38e97c5d7d3585a2cbf3f9580c82ca33985f9cb0845d4dcce220cb709f9538b0'
  // }

  // BCHN Mainnet test wallet
  configOut = {
    NETWORK: 'mainnet',
    port: process.env.PORT || 5000,
    BCH_ADDR: 'bitcoincash:qzdq6jzvyzhyuj639l72rmqfzu3vd7eux5nhdzndwm',
    SLP_ADDR: 'simpleledger:qq0qr5aqv6whvjrhfygk7s38qmuglf5sm5ufqqaqm5',
    TOKENS_QTY_ORIGINAL: 50000,
    BCH_QTY_ORIGINAL: 250,
    SLP_TOKEN_ID:
      'd0ef4de95b78222bfee2326ab11382f4439aa0855936e2fe6ac129a8d778baa0'
  }
} else {
  configOut = {
    NETWORK: 'testnet',
    port: process.env.PORT || 5100,
    BCH_ADDR: 'bchtest:qpz5hez3qmzrnjzdfu03tf7fp6ca0rlsaqvrxmfpyd',
    SLP_ADDR: 'slptest:qpt74e74f75w6s7cd8r9p5fumvdhqf995g69udvd5n',
    TOKENS_QTY_ORIGINAL: 50000,
    BCH_QTY_ORIGINAL: 250,
    SLP_TOKEN_ID:
      '155784a206873c98acc09e8dabcccf6abf13c4c14d8662190534138a16bb93ce'
  }
}

configOut.logPass = 'test'

// Email
configOut.emailServer = process.env.EMAILSERVER
  ? process.env.EMAILSERVER
  : 'mail.someserver.com'
configOut.emailUser = process.env.EMAILUSER
  ? process.env.EMAILUSER
  : 'noreply@someserver.com'
configOut.emailPassword = process.env.EMAILPASS
  ? process.env.EMAILPASS
  : 'emailpassword'

configOut.logPass = process.env.LOGPASS ? process.env.LOGPASS : 'test'

module.exports = configOut
