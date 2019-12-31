/*
  This library contains general utility functions. This library is specific
  to token-liquidty, which is why its in the lib/ folder and not the utils/
  folder.
*/

'use strict'

// const config = require('../../config')
const fs = require('fs')

const config = require('../../config')

// Winston logger
const wlogger = require('../utils/logging')

class TLUtils {
  // constructor () {}

  // Round a number to 8 decimal places, the standard used for Bitcoin.
  round8 (numIn) {
    return Math.floor(numIn * 100000000) / 100000000
  }

  // Save the app state to a JSON file.
  saveState (data) {
    try {
      wlogger.silly(`entering util.js/saveState().`)

      const filename = `${__dirname}/../../state/state.json`

      return new Promise((resolve, reject) => {
        fs.writeFile(filename, JSON.stringify(data, null, 2), function (err) {
          if (err) {
            wlogger.error(`Error in token-util.js/saveState(): `, err)
            return reject(err)
          }

          wlogger.silly(`Successfully saved to state.json`)

          // console.log(`${name}.json written successfully.`)
          return resolve()
        })
      })
    } catch (err) {
      wlogger.debug(`Error in token-util.js/saveState()`)
      throw err
    }
  }

  // Open and read the state JSON file.
  readState (filename) {
    try {
      // Delete the cached copy of the data.
      delete require.cache[require.resolve(filename)]

      const data = require(filename)
      return data
    } catch (err) {
      wlogger.debug(`Error in util.js/readState()`)
      throw new Error(`Could not open ${filename}`)
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
      throw new Error(`wallet file not found`)
    }
  }

  sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

module.exports = TLUtils
