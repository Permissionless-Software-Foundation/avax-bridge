/*
  Liquidity app for SLP BCH tokens inspired by Bancors whitepaper
*/

'use strict'

// const lib = require('../src/lib/token-util.js')
const got = require('got')

const SLP = require('../src/lib/slp')
const slp = new SLP()

const BCH = require('../src/lib/bch')
const bch = new BCH()

// App utility functions library.
const TLUtils = require('../src/lib/util')
const tlUtil = new TLUtils()

const Transactions = require('../src/lib/transactions')
const txs = new Transactions()

const TokenLiquidity = require('../src/lib/token-liquidity')
const lib = new TokenLiquidity()

const config = require('../config')
config.bchBalance = config.BCH_QTY_ORIGINAL
config.tokenBalance = config.TOKENS_QTY_ORIGINAL

// Winston logger
const wlogger = require('../src/utils/logging')

// Used for debugging.
const util = require('util')
util.inspect.defaultOptions = {
  showHidden: true,
  colors: true
}

const BCH_ADDR1 = config.BCH_ADDR
// const TOKEN_ID = config.TOKEN_ID

let bchBalance
let tokenBalance

async function startTokenLiquidity () {
  // Get BCH balance.
  const addressInfo = await bch.getBCHBalance(config.BCH_ADDR, false)
  bchBalance = addressInfo.balance
  config.bchBalance = bchBalance
  wlogger.info(`BCH address ${config.BCH_ADDR} has a balance of ${bchBalance} BCH`)

  // Get SLP token balance
  tokenBalance = await slp.getTokenBalance(config.SLP_ADDR)
  wlogger.info(`SLP token address ${config.SLP_ADDR} has a balance of: ${tokenBalance}`)
  config.tokenBalance = tokenBalance

  // Get the BCH-USD exchange rate.
  let USDperBCH
  try {
    const rawRate = await got(`https://api.coinbase.com/v2/exchange-rates?currency=BCH`)
    const jsonRate = JSON.parse(rawRate.body)
    // console.log(`jsonRate: ${JSON.stringify(jsonRate, null, 2)}`);
    USDperBCH = jsonRate.data.rates.USD
    wlogger.info(`USD/BCH exchange rate: $${USDperBCH}`)

    config.usdPerBCH = USDperBCH
  } catch (err) {
    wlogger.error(`Coinbase exchange rate could not be retrieved!. Assuming hard coded value.`)
    wlogger.error(err)
    USDperBCH = 560
  }

  // Calculate exchange rate spot price.;
  const marketCap = USDperBCH * bchBalance
  console.log(`Market cap of BCH controlled by app: $${marketCap}`)
  const price = marketCap / tokenBalance
  console.log(`Token spot price: $${price}`)

  // Get the last transaction associated with this address.
  let lastTransaction = await txs.getLastConfirmedTransaction(BCH_ADDR1)

  // Periodically check the last transaction.
  setInterval(async function () {
    // console.log(`Checking transactions...`)
    const obj = {
      bchAddr: BCH_ADDR1,
      txid: lastTransaction,
      bchBalance: bchBalance,
      tokenBalance: tokenBalance
    }

    const retObj = await lib.compareLastTransaction(obj)
    const newTx = retObj.lastTransaction

    // Save the updated price information.
    await tlUtil.saveState(config)

    // Update the last transaction.
    if (newTx) lastTransaction = newTx
    if (retObj.bchBalance) bchBalance = retObj.bchBalance
    if (retObj.tokenBalance) tokenBalance = retObj.tokenBalance

    const now = new Date()

    // New Balances:
    wlogger.info(`bchBalance: ${bchBalance}, tokenBalance: ${tokenBalance}, timestamp: ${now.toLocaleString()}`)

    config.bchBalance = bchBalance
    config.tokenBalance = tokenBalance
  }, 60000 * 2)
}

module.exports = {
  startTokenLiquidity
}
