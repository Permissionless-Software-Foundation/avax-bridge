/*
  This library contains general utility functions. This library is specific
  to token-liquidty, which is why its in the lib/ folder and not the utils/
  folder.
*/

'use strict'

// const config = require('../../config')
const fs = require('fs')
const got = require('got')

const config = require('../../config')

// Winston logger
const wlogger = require('./wlogger')

const BCH = require('./bch')
const bch = new BCH()

const TokenLiquidity = require('./token-liquidity')
const tokenApp = new TokenLiquidity()

const STATE_FILE_NAME = `${__dirname}/../../state/state.json`

class TLUtils {
  // constructor () {}

  // Round a number to 8 decimal places, the standard used for Bitcoin.
  round8 (numIn) {
    return Math.floor(numIn * 100000000) / 100000000
  }

  // Save the app state to a JSON file.
  saveState (data) {
    try {
      wlogger.silly('entering util.js/saveState().')

      const filename = STATE_FILE_NAME

      return new Promise((resolve, reject) => {
        fs.writeFile(filename, JSON.stringify(data, null, 2), function (err) {
          if (err) {
            wlogger.error('Error in token-util.js/saveState(): ', err)
            return reject(err)
          }

          wlogger.silly('Successfully saved to state.json')

          // console.log(`${name}.json written successfully.`)
          return resolve()
        })
      })
    } catch (err) {
      wlogger.debug('Error in token-util.js/saveState()')
      throw err
    }
  }

  // Open and read the state JSON file.
  readState () {
    try {
      // Delete the cached copy of the data.
      delete require.cache[require.resolve(STATE_FILE_NAME)]

      const data = require(STATE_FILE_NAME)
      return data
    } catch (err) {
      wlogger.debug('Error in util.js/readState()')
      throw new Error(`Could not open ${STATE_FILE_NAME}`)
    }
  }

  // Opens the wallet file and returns the contents.
  openWallet () {
    try {
      let walletInfo

      if (config.NETWORK === 'testnet') {
        walletInfo = require(`${__dirname}/../../wallet-test.json`)
      } else {
        walletInfo = require(`${__dirname}/../../wallet-main.json`)
      }
      // console.log(`walletInfo in slp: ${JSON.stringify(walletInfo, null, 2)}`)

      return walletInfo
    } catch (err) {
      throw new Error('wallet file not found')
    }
  }

  sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Gets the current spot price of BCH/USD from Coinbase. Returns the previously
  // saved price from the state.json file if the price can not be retrieved.
  // It will save the price to the state file when new priceses can be successfully
  // retrieved.
  async getPrice () {
    try {
      let USDperBCH
      try {
        const rawRate = await got(
          'https://api.coinbase.com/v2/exchange-rates?currency=BCH'
        )
        const jsonRate = JSON.parse(rawRate.body)
        // console.log(`jsonRate: ${JSON.stringify(jsonRate, null, 2)}`);

        USDperBCH = jsonRate.data.rates.USD
        wlogger.debug(`USD/BCH exchange rate: $${USDperBCH}`)

        config.usdPerBCH = USDperBCH

        // Update the BCH balance
        const addressInfo = await bch.getBCHBalance(config.BCH_ADDR, false)
        const bchBalance = addressInfo.balance
        config.bchBalance = bchBalance

        // Update the effective SLP balance.
        const effBal = tokenApp.getEffectiveTokenBalance(bchBalance)
        config.tokenBalance = effBal

        // Save the state.
        await this.saveState(config)

        return config.usdPerBCH
      } catch (err) {
        wlogger.error(
          'Coinbase exchange rate could not be retrieved!. Retrieving price from state.'
        )
        wlogger.error(err)

        const state = this.readState()
        return state.usdPerBCH
      }
    } catch (err) {
      wlogger.error('Error in util.js/getPrice()')
      throw err
    }
  }
}

module.exports = TLUtils
