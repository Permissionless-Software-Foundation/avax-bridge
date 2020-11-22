// Establish the network, default to 'mainnet'
// const NETWORK = process.env.NETWORK ? process.env.NETWORK : `mainnet`
const NETWORK = process.env.NETWORK ? process.env.NETWORK : 'testnet'

let configOut = {}

if (NETWORK === 'mainnet') {
  configOut = {
    NETWORK: 'mainnet',
    port: process.env.PORT || 5000,
    BCH_ADDR: 'bitcoincash:qrnn49rx0p4xh78tts79utf0zv26vyru6vqtl9trd3',
    SLP_ADDR: 'simpleledger:qzhrpmu7nruyfcemeanqh5leuqcnf6zkjqems7xqf3',
    TOKENS_QTY_ORIGINAL: 50000,
    BCH_QTY_ORIGINAL: 250,
    SLP_TOKEN_ID:
      '38e97c5d7d3585a2cbf3f9580c82ca33985f9cb0845d4dcce220cb709f9538b0'
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

configOut.port = process.env.PORT || 5001
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
