/*
  Configuration settings for bch-js and bch-api.
*/

'use strict'

// default rest API.
let RESTAPI = 'fullstack.cash'
// let RESTAPI = 'bitcoin.com'

// Override the RESTAPI setting if envronment variable is set.
if (process.env.RESTAPI && process.env.RESTAPI !== '') {
  RESTAPI = process.env.RESTAPI
}

// Ensure bch-js can pick up the env var.
process.env.RESTAPI = RESTAPI

const BCHJS = require('@psf/bch-js')
// const BITBOX = require('slp-sdk')

const config = {}

if (RESTAPI === 'fullstack.cash') {
  // config.BCHLIB = BCHJS.BitboxShim()
  config.BCHLIB = BCHJS
  config.MAINNET_REST = 'https://bchn.fullstack.cash/v3/'
  config.TESTNET_REST = 'https://testnet3.fullstack.cash/v3/'
  config.RESTAPI = 'fullstack.cash'
}

// Use bch-js but use it with the bitcoin.com infrastructure.
if (RESTAPI === 'rest.bitcoin.com') {
  config.BCHLIB = BCHJS.BitboxShim()
  config.MAINNET_REST = 'https://rest.bitcoin.com/v2/'
  config.TESTNET_REST = 'http://157.245.141.224:3000/v2/'
  config.RESTAPI = 'rest.bitcoin.com'
}

// Use bch-js with local infrastructure.
if (RESTAPI === 'local') {
  config.BCHLIB = BCHJS.BitboxShim()
  // config.MAINNET_REST = `http://192.168.0.36:12400/v3/`
  // config.TESTNET_REST = `http://192.168.0.38:13400/v3/`
  config.MAINNET_REST = 'http://127.0.0.1:3000/v3/'
  config.TESTNET_REST = 'http://decatur.hopto.org:13400/v3/'
  config.RESTAPI = 'local'
}

// Use bch-js with decatur infrastructure.
if (RESTAPI === 'decatur') {
  config.BCHLIB = BCHJS.BitboxShim()
  config.MAINNET_REST = 'http://decatur.hopto.org:12400/v3/'
  config.TESTNET_REST = 'http://decatur.hopto.org:13400/v3/'
  config.RESTAPI = 'decatur'
}

module.exports = config
