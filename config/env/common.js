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
    BCH_ADDR: `bchtest:qz4qnxcxwvmacgye8wlakhz0835x0w3vtvaga95c09`,  // bchtest:qr8tqc5ucmwrrls5upyc32hhpmjp5a7sxyspt6x89f
    SLP_ADDR: `slptest:qz4qnxcxwvmacgye8wlakhz0835x0w3vtvxu67w0ac`, // `slptest:qr8tqc5ucmwrrls5upyc32hhpmjp5a7sxyt4vpush5`,
    TOKENS_QTY_ORIGINAL: 5000,
    BCH_QTY_ORIGINAL: 25,
    SLP_TOKEN_ID: '7ac7f4bb50b019fe0f5c81e3fc13fc0720e130282ea460768cafb49785eb2796' // '3282bf6f2f5700b290a909c3e3559f8e64ca7a8d5fc8a037bd48601c310bd6d6'
  }
}

module.exports = configOut
