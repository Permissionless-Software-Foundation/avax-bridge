// Establish the network, default to 'mainnet'
// const NETWORK = process.env.NETWORK ? process.env.NETWORK : `mainnet`
const NETWORK = process.env.NETWORK ? process.env.NETWORK : 'mainnet'

let configOut = {}

// Normal mainnet wallet.
configOut = {
  NETWORK: NETWORK,
  port: process.env.PORT || 5000,
  BCH_ADDR: process.env.BCH_ADDR
    ? process.env.BCH_ADDR
    : 'bitcoincash:qrmjjjhz0a7dhp46ymw36l9zd0wcfryahq3s4989yj',
  SLP_ADDR: process.env.SLP_ADDR
    ? process.env.SLP_ADDR
    : 'simpleledger:qrmjjjhz0a7dhp46ymw36l9zd0wcfryahqat77j96v',
  AVAX_ADDR: process.env.AVAX_X_ADDR
    ? process.env.AVAX_X_ADDR
    : 'X-avax1anlgfmys9m7fcu5frkdnga6eajka37lzem8wp4',
  AVAX_TOKEN_ID: process.env.AVAX_TOKEN
    ? process.env.AVAX_TOKEN
    : '2Df96yHyhNc3vooieNNhyKwrjEfTsV2ReMo5FKjMpr8vwN4Jqy',
  TOKENS_QTY_ORIGINAL: 1,
  BCH_QTY_ORIGINAL: 1,
  SLP_TOKEN_ID: process.env.SLP_TOKENID
    ? process.env.SLP_TOKENID
    : 'c43eb59134473addee345df4172f4432bd09a8f087ba683462f0d66f8d221213'
}

// Env vars for slp-avax-bridge lib.
process.env.TOKENID = configOut.SLP_TOKEN_ID

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
