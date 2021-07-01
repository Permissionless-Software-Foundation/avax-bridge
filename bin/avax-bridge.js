/*
  Liquidity app for SLP BCH tokens inspired by Bancors whitepaper
*/

'use strict'

const config = require('../config')
config.bchBalance = config.BCH_QTY_ORIGINAL
config.tokenBalance = config.TOKENS_QTY_ORIGINAL

// Instantiate the JWT handling library for FullStack.cash.
const JwtLib = require('jwt-bch-lib')
const jwtLib = new JwtLib({
  // Overwrite default values with the values in the config file.
  server: 'https://auth.fullstack.cash',
  login: process.env.FULLSTACKLOGIN,
  password: process.env.FULLSTACKPASS
})

const SLP = require('../src/lib/slp')
let slp = new SLP(config)

const BCH = require('../src/lib/bch')
let bch = new BCH(config)

const AVAX = require('../src/lib/avax')
let avax = new AVAX(config)

const { default: PQueue } = require('p-queue')
const queue = new PQueue({ concurrency: 1 })

// App utility functions library.
const TLUtils = require('../src/lib/util')
const tlUtil = new TLUtils()

// const Transactions = require('../src/lib/transactions')
// const txs = new Transactions()

const TokenLiquidity = require('../src/lib/token-liquidity')
const lib = new TokenLiquidity()

// Add the queue to the token-liquidity library
lib.queue = queue

// Winston logger
const wlogger = require('../src/lib/wlogger')

// Used for debugging.
const util = require('util')
util.inspect.defaultOptions = {
  showHidden: true,
  colors: true
}

// const BCH_ADDR1 = config.BCH_ADDR
// const TOKEN_ID = config.TOKEN_ID

const TWO_MINUTES = 60000 * 2
const FIVE_MINUTES = 60000 * 5
// const CONSOLIDATE_INTERVAL = 60000 * 100
const PRICE_UPDATE_INTERVAL = 60000 * 5
let timerHandle

let bchBalance
let tokenBalance
let avaxBalance

async function startAvaxBridge () {
  // Read in the state file.
  try {
    const state = tlUtil.readState()
    console.log(`state: ${JSON.stringify(state, null, 2)}`)
  } catch (err) {
    wlogger.error('Could not read state.json file.')
  }

  // Get the JWT token needed to interact with the FullStack.cash API.
  await getJwt()
  bch = new BCH(config) // Reinitialize bchjs with the JWT token.
  slp = new SLP(config) // Reinitialize bchjs with the JWT token.
  avax = new AVAX(config)

  // Get BCH balance.
  const addressBalance = await bch.getBCHBalance(config.BCH_ADDR, false)
  bchBalance = addressBalance
  config.bchBalance = bchBalance
  wlogger.info(
    `BCH address ${config.BCH_ADDR} has a balance of ${bchBalance} BCH`
  )

  // console.log(`addressInfo: ${JSON.stringify(addressInfo, null, 2)}`)

  // Get all the TXIDs associated with this apps addresses. The app assumes all
  // these TXs have been processed.
  // const seenTxs = addressInfo.txids
  const historicalTxs = await bch.getTransactions(config.BCH_ADDR)
  const seenTxs = bch.justTxs(historicalTxs)

  const historicalAvaxTxs = await avax.getTransactions(config.AVAX_ADDR)
  const seenAvaxTxs = avax.justTxs(historicalAvaxTxs)
  // console.log(`seenTxs: ${JSON.stringify(seenTxs, null, 2)}`)

  const waitingList = []

  // Get SLP token balance
  tokenBalance = await slp.getTokenBalance(config.SLP_ADDR)
  wlogger.info(
    `SLP token address ${config.SLP_ADDR} has a balance of: ${tokenBalance} PSF`
  )
  avaxBalance = await avax.getTokenBalance(config.AVAX_ADDR, true)
  wlogger.info(
    `AVAX address ${config.AVAX_ADDR} has a token balance of: ${avaxBalance} tokens`
  )
  config.tokenBalance = tokenBalance
  config.avaxBalance = avaxBalance

  // Get the BCH-USD exchange rate.
  const USDperBCH = await lib.getPrice()

  // Calculate exchange rate spot price.;
  const marketCap = USDperBCH * bchBalance
  console.log(`Market cap of BCH controlled by app: $${marketCap}`)
  const price = lib.getSpotPrice(bchBalance, USDperBCH)
  console.log(`Token spot price: $${price}`)

  // Kick off the processing loop. It periodically checks for new transactions
  // and reacts to them.
  timerHandle = setInterval(async function () {
    await processingLoop(seenTxs, seenAvaxTxs, waitingList)
  }, TWO_MINUTES)

  // Interval to consolidate UTXOs (maintenance)
  // setInterval(async function () {
  //  const hex = await bch.consolidateUtxos()

  // Exit if there is not enough UTXOs to consolidate.
  //  if (!hex) return

  //  wlogger.info('consolidateUtxos hex: ', hex)

  //  await bch.broadcastBchTx(hex)
  // }, CONSOLIDATE_INTERVAL)

  // Interval to update BCH spot price.
  setInterval(async function () {
    console.log('Updating BCH price.')
    await lib.getPrice()
  }, PRICE_UPDATE_INTERVAL)

  // Renew the JWT token every 24 hours
  setInterval(async function () {
    wlogger.info('Updating FullStack.cash JWT token')
    await getJwt()
    bch = new BCH() // Reinitialize bchjs with the JWT token.
    slp = new SLP() // Reinitialize bchjs with the JWT token.
  }, 60000 * 60 * 24)

  // Periodically write out status information to the log file. This ensures
  // the log file is created every day and the the /logapi route works.
  setInterval(function () {
    checkBalances()
  }, 60000 * 60) // 1 hour
}

// This 'processing loop' function is called periodically to identify and process
// any new transactions.
async function processingLoop (seenTxs, seenAvaxTxs, waitingList) {
  try {
    const now = new Date()
    let outStr = `${now.toLocaleString()}: Checking transactions... `
    const assetDescription = await avax.getAssetDescription()

    const obj = {
      seenTxs,
      seenAvaxTxs
    }

    const newTxids = await lib.detectNewTxs(obj)
    const newAvaxTx = await lib.detectNewAvaxTxs(obj)
    // console.log(`newTxids: ${JSON.stringify(newTxids, null, 2)}`)

    // If there are no new transactions, exit.
    if (newTxids.length === 0) {
      // Retrieve the balances from the blockchain.
      const retObj2 = await lib.getBlockchainBalances(config.BCH_ADDR)
      // console.log(`retObj2: ${JSON.stringify(retObj2, null, 2)}`)

      // Update the app balances.
      bchBalance = retObj2.bchBalance
      tokenBalance = retObj2.tokenBalance

      outStr += `\n\t...nothing new on SLP. SLP: ${tokenBalance}`
    } else {
      newTxids.map((x) => seenTxs.push(x.txid))
      outStr += `\n\t...${newTxids.length} new transactions found on SLP!`
    }

    if (newAvaxTx.length === 0) {
      // Retrieve the balances from the avalanche X chain.
      const retObj3 = await avax.getTokenBalance(config.AVAX_ADDR, true)

      // Update the app balances.
      avaxBalance = retObj3

      outStr += `\n\t...nothing new on avax. Token amount: ${avaxBalance}`
    } else {
      newAvaxTx.map((x) => seenAvaxTxs.push(x.id))
      outStr += `\n\t...${newAvaxTx.length} new transactions found on avalanche!`
    }

    if (newAvaxTx.length === 0 && newTxids.length === 0) {
      console.log(`${outStr}`)
      console.log(' ')
      return
    }

    // Add the new txids to the seenTxs array.
    console.log(`${outStr}`)
    // process the new AVALANCHE TX.
    let hasBroadcasted = false
    for (let i = 0; i < newAvaxTx.length; i++) {
      const result = await lib.processAvaxTx(newAvaxTx[i], assetDescription)
      if (result.refundTx) {
        // wait 5 seconds just in case the Avalanche network has to catch up
        // after sending tokens back
        await sleep(5000)
      }

      if (!result.isValid) {
        continue
      }
      // Sleep for 5 minutes to give Blockbook time to process the last transaction.
      // another slp tx has been broadcasted recently
      if (hasBroadcasted) {
        clearInterval(timerHandle)
        await waitForBlockbook(seenAvaxTxs)
      }

      await queue.add(() => lib.pRetryMintSlp(result))

      if (hasBroadcasted) {
        timerHandle = setInterval(async function () {
          await processingLoop(seenTxs, seenAvaxTxs, waitingList)
        }, TWO_MINUTES)
      }

      hasBroadcasted = true
      console.log(`queue.size: ${queue.size}`)
    }

    // process the new TX.
    for (let i = 0; i < newTxids.length; i++) {
      const obj = {
        txid: newTxids[i].txid,
        isTokenTx: newTxids[i].tokens,
        bchBalance,
        tokenBalance
      }

      console.log(' ')
      console.log(' ')
      console.log(
        `Processing new transaction on slp with this data: ${JSON.stringify(
          obj,
          null,
          2
        )}`
      )

      clearInterval(timerHandle)

      // at least one slp tx has been broadcasted recently by the bridge as a response to a avax tx
      if (hasBroadcasted) {
        hasBroadcasted = false
        await waitForBlockbook(seenAvaxTxs)
      }

      // check if the txid is in the waiting list
      const memoindex = waitingList.findIndex((item) => item.txid === obj.txid)
      const inList = memoindex >= 0
      const result = await queue.add(() => lib.pRetryProcessTx(obj, inList, assetDescription))
      // console.log(`result: ${JSON.stringify(result, null, 2)}`)

      if (result.type === 'token' && inList) {
        // wait 5 seconds just in case the Avalanche network has to catch up
        await sleep(5000)
        const memoTx = waitingList[memoindex]
        const obj = {
          amount: result.amount,
          addr: memoTx.addr
        }
        await queue.add(() => lib.pRetryMintAvax(obj))
        // remove the tx from the waiting list
        wlogger.info(`Removing ${memoTx.txid} from waiting list`)
        waitingList.splice(memoindex, 1)
      }

      // If the app received an opreturn add it to the waitingList
      if (result.type === 'avax') {
        wlogger.info(`Adding ${result.txid} to waiting list`)
        waitingList.push({
          txid: result.txid,
          addr: result.addr
        })
      }

      // Update the app balances. This temporarily updates the app balances until
      // processing is complete, at which time the app can get its balance from
      // an indexer.
      // CT 7/9/2020 - Added if statement to try and get around an issue I saw
      // in the logs where the values were coming back as undefined.
      if (result.bchBalance && result.tokenBalance) {
        bchBalance = result.bchBalance
        tokenBalance = result.tokenBalance
      } else {
        wlogger.error(
          `bchBalance or tokenBalance returned a non-true value: ${result.bchBalance}, ${result.tokenBalance}`
        )
      }
      console.log(`BCH: ${bchBalance}, SLP: ${tokenBalance}`)
      console.log(' ')

      // Sleep for 5 minutes to give Blockbook time to process the last transaction.
      // If result.txid === null, it's a self-generated TX, so we don't need to wait.
      if (result.type === 'token') {
        await waitForBlockbook(seenTxs)
      }

      timerHandle = setInterval(async function () {
        await processingLoop(seenTxs, seenAvaxTxs, waitingList)
      }, TWO_MINUTES)
    }
  } catch (err) {
    wlogger.error('Error in token-liquidity.js.', err)
    console.log(' ')
    console.log('Err: ', err)
  }
}

// Sleep for 5 minutes to give Blockbook time to process the last transaction.
// Disables the processing loop while it waits.
async function waitForBlockbook (seenTxs) {
  const now = new Date()
  wlogger.info(
    `${now.toLocaleString()}: Waiting 5 minutes before processing next transaction...`
  )

  // clearInterval(timerHandle)
  await sleep(FIVE_MINUTES)
  console.log('...continuing processing.')
}

// Get's a JWT token from FullStack.cash.
// This code based on the jwt-bch-demo:
// https://github.com/Permissionless-Software-Foundation/jwt-bch-demo
async function getJwt () {
  try {
    // Log into the auth server.
    await jwtLib.register()

    let apiToken = jwtLib.userData.apiToken

    // Ensure the JWT token is valid to use.
    const isValid = await jwtLib.validateApiToken()

    // Get a new token with the same API level, if the existing token is not
    // valid (probably expired).
    if (!isValid.isValid) {
      apiToken = await jwtLib.getApiToken(jwtLib.userData.apiLevel)
      wlogger.info('The JWT token was not valid. Retrieved new JWT token.\n')
    } else {
      wlogger.info('JWT token is valid.\n')
    }

    // Set the environment variable.
    process.env.BCHJSTOKEN = apiToken
  } catch (err) {
    wlogger.error('Error in avax-bridge.js/getJwt(): ', err)
    throw err
  }
}

// Called by a timer interval to create a timestamp and check balances.
async function checkBalances () {
  try {
    const state = tlUtil.readState()
    const effTokenBal = lib.getEffectiveTokenBalance(state.bchBalance)
    const realTokenBal = await slp.getTokenBalance()
    const avaxTokenBal = await avax.getTokenBalance(config.AVAX_ADDR, true)

    wlogger.info(
      `usdPerBCH: ${state.usdPerBCH}, ` +
        `tokens in avalanche: ${avaxTokenBal}, ` +
        `BCH balance: ${state.bchBalance}, ` +
        `Actual token balance: ${realTokenBal}, ` +
        `Effective token balance: ${effTokenBal}`
    )
  } catch (err) {
    wlogger.error('Error in checkBalances(): ', err)
  }
}

function sleep (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

module.exports = {
  startAvaxBridge
}
