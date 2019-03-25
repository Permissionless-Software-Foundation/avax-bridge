// Establish the network, default to 'testnet'
const NETWORK = process.env.NETWORK ? process.env.NETWORK : `testnet`

let configOut = {}

if (NETWORK === `mainnet`) {
  configOut = {
    NETWORK: `mainnet`,
    port: process.env.PORT || 5000,
    TOKEN_ID: 249,
    BCH_ADDR: `bitcoincash:qzl6k0wvdd5ky99hewghqdgfj2jhcpqnfq8xtct0al`,
    TOKENS_QTY_ORIGINAL: 5000,
    BCH_QTY_ORIGINAL: 25,
    SLP_TOKEN_ID: '38e97c5d7d3585a2cbf3f9580c82ca33985f9cb0845d4dcce220cb709f9538b0'
  }
} else {
  configOut = {
    NETWORK: `testnet`,
    port: process.env.PORT || 5100,
    TOKEN_ID: 556,
    BCH_ADDR: `bchtest:qq8wqgxq0uu4y6k92pw9f7s6hxzfp9umsvtg39pzqf`,
    TOKENS_QTY_ORIGINAL: 5000,
    BCH_QTY_ORIGINAL: 25,
    SLP_TOKEN_ID: '7ac7f4bb50b019fe0f5c81e3fc13fc0720e130282ea460768cafb49785eb2796'
  }
}

module.exports = configOut
