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
    for (let i = INCREMENT; i < 20000; i += INCREMENT) {
      const obj = {
        tokenIn: INCREMENT,
        tokenBalance: i,
        bchOriginalBalance: BCH_QTY_ORIGINAL,
        tokenOriginalBalance: TOKENS_QTY_ORIGINAL
      }

      const bchOut = lib.exchangeTokensForBCH(obj)

      console.log(`balance: ${i}, tokensIn: ${INCREMENT}`)
      console.log(`bchOut: ${bchOut}`)
      // console.log(`${i+INCREMENT},${}`)
      // console.log(`${tlUtil.round8(i + INCREMENT)},${tlUtil.round8(tokenInfo.token2)},${tlUtil.round8(tokenInfo.tokensOut)}`)
    }
  } catch (err) {
    console.log(`Error in runTest(): `, err)
  }
}

runTest()
