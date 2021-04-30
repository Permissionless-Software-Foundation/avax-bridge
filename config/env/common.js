// Establish the network, default to 'mainnet'
// const NETWORK = process.env.NETWORK ? process.env.NETWORK : `mainnet`
const NETWORK = process.env.NETWORK ? process.env.NETWORK : 'testnet'

let configOut = {}

if (NETWORK === 'mainnet') {
  // Normal mainnet wallet.
  configOut = {
    NETWORK: 'mainnet',
    port: process.env.PORT || 5000,

    // 145 derivation address.
    BCH_ADDR: 'bitcoincash:qqd6adqvk0m7cmhjy4736r9dawjt3q8wmqsk3dcx3p',

    // 245 derivation address
    SLP_ADDR: 'simpleledger:qqd6adqvk0m7cmhjy4736r9dawjt3q8wmqud6kdx0l',
    AVAX_ADDR: 'X-avax150agl543yn0n5z9z20tgmrggs8fc2ckkma4qfv',
    AVAX_TOKEN_ID: '2tEi6r6PZ9VXHogUmkCzvijmW81TRNjtKWnR4FA55zTPc87fxC',
    TOKENS_QTY_ORIGINAL: 50000,
    BCH_QTY_ORIGINAL: 250,
    SLP_TOKEN_ID:
      '69d9575df68d90b435186afc6c6ea3f7e898cb487adbd947dc7a5bb4e3789cbd'
  }
} else {
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
    SLP_TOKEN_ID:
      '155784a206873c98acc09e8dabcccf6abf13c4c14d8662190534138a16bb93ce'
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
