// Establish the network, default to 'mainnet'
// const NETWORK = process.env.NETWORK ? process.env.NETWORK : `mainnet`
const NETWORK = process.env.NETWORK ? process.env.NETWORK : `testnet`

let configOut = {}

if (NETWORK === `mainnet`) {
  configOut = {
    NETWORK: `mainnet`,
    port: process.env.PORT || 5000,
    BCH_ADDR: `bitcoincash:qzl6k0wvdd5ky99hewghqdgfj2jhcpqnfq8xtct0al`,
    SLP_ADDR: `simpleledger:qz9l5w0fvp670a8r48apsv0xqek840320c90neac9g`,
    TOKENS_QTY_ORIGINAL: 5000,
    BCH_QTY_ORIGINAL: 25,
    SLP_TOKEN_ID: '38e97c5d7d3585a2cbf3f9580c82ca33985f9cb0845d4dcce220cb709f9538b0'
  }
} else {
  configOut = {
    NETWORK: `testnet`,
    port: process.env.PORT || 5100,
    BCH_ADDR: `bchtest:qpz5hez3qmzrnjzdfu03tf7fp6ca0rlsaqvrxmfpyd`,
    SLP_ADDR: `slptest:qpz5hez3qmzrnjzdfu03tf7fp6ca0rlsaqhhpqnkks`,
    TOKENS_QTY_ORIGINAL: 5000,
    BCH_QTY_ORIGINAL: 25,
    SLP_TOKEN_ID: '155784a206873c98acc09e8dabcccf6abf13c4c14d8662190534138a16bb93ce'
  }
}

module.exports = configOut
