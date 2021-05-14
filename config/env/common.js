// Establish the network, default to 'mainnet'
// const NETWORK = process.env.NETWORK ? process.env.NETWORK : `mainnet`
const NETWORK = process.env.NETWORK ? process.env.NETWORK : 'testnet'

let configOut = {}

if (NETWORK === 'testnet') {
  configOut = {
    NETWORK: 'testnet',
    port: process.env.PORT || 5100,

    // 145 derivation path
    BCH_ADDR: 'bchtest:qpl7x6u3pmwhf7ekjgqpjgy9fawgy9k5du0z8a8szj',

    // 245 derivation path
    SLP_ADDR: 'slptest:qptg4zdvrtxhxw4dyhvrqsjkae0tp58efg5layz4n5',
    AVAX_ADDR: 'X-avax150agl543yn0n5z9z20tgmrggs8fc2ckkma4qfv',
    AVAX_TOKEN_ID: '2tEi6r6PZ9VXHogUmkCzvijmW81TRNjtKWnR4FA55zTPc87fxC',
    TOKENS_QTY_ORIGINAL: 50000,
    BCH_QTY_ORIGINAL: 250,
    SLP_TOKEN_ID: 'c7cb019764df3a352d9433749330b4b2eb022d8fbc101e68a6943a7a58a8ee84'
  }
} else {
  // Normal mainnet wallet.
  configOut = {
    NETWORK: 'mainnet',
    port: process.env.PORT || 5000,

    // 145 derivation address.
    BCH_ADDR: 'bitcoincash:qrmjjjhz0a7dhp46ymw36l9zd0wcfryahq3s4989yj',

    // 245 derivation address
    SLP_ADDR: 'simpleledger:qrmjjjhz0a7dhp46ymw36l9zd0wcfryahqat77j96v',
    AVAX_ADDR: 'X-avax1anlgfmys9m7fcu5frkdnga6eajka37lzem8wp4',
    AVAX_TOKEN_ID: '2Df96yHyhNc3vooieNNhyKwrjEfTsV2ReMo5FKjMpr8vwN4Jqy',
    TOKENS_QTY_ORIGINAL: 50000,
    BCH_QTY_ORIGINAL: 250,
    SLP_TOKEN_ID: 'c7cb019764df3a352d9433749330b4b2eb022d8fbc101e68a6943a7a58a8ee84'
  }
}

configOut.logPass = 'test'
// Avalanche Wallet key
configOut.AVAX_PRIVATE_KEY = process.env.AVAX_PRIVATE_KEY

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
