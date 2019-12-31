/*
  This isn't really a 'test'. Instead it maps out the values produced by the
  exchangeTokensForBCH() function so that they can be plotted in a spreadsheet
  and analyzed for errors.
*/

const TokenLiquidity = require('../../src/lib/token-liquidity')
const lib = new TokenLiquidity()

// App utility functions library.
// const TLUtils = require('../../src/lib/util')
// const tlUtil = new TLUtils()

const BCH_QTY_ORIGINAL = 25.0
const TOKENS_QTY_ORIGINAL = 5000.0

const INCREMENT = 500
// let bchBalance = INCREMENT

// map out the exchangeTokensForBCH() function
function runTest () {
  try {
    // Loop through linear increases in BCH.
    for (let i = -5000; i < 30000; i += INCREMENT) {
      const obj = {
        tokenIn: INCREMENT,
        tokenBalance: i,
        bchOriginalBalance: BCH_QTY_ORIGINAL,
        tokenOriginalBalance: TOKENS_QTY_ORIGINAL
      }

      const bchOut = lib.exchangeTokensForBCH(obj)

      // console.log(`token balance: ${i}, tokensIn: ${INCREMENT}, bchOut: ${bchOut.bchOut}, new bch balance: ${bchOut.bch2}, new token balance: ${bchOut.token2 + TOKENS_QTY_ORIGINAL}`)
      // console.log(`bchOut: ${JSON.stringify(bchOut, null, 2)}`)

      console.log(`${bchOut.token2 + TOKENS_QTY_ORIGINAL},${bchOut.bch2},${bchOut.bchOut}`)
    }
  } catch (err) {
    console.log(`Error in runTest(): `, err)
  }
}

runTest()
