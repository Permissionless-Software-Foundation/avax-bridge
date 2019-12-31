/*
  This isn't really a 'test'. Instead it maps out the values produced by the
  exchangeBCHForTokens() function so that they can be plotted in a spreadsheet
  and analyzed for errors.
*/

const TokenLiquidity = require('../../src/lib/token-liquidity')
const lib = new TokenLiquidity()

// App utility functions library.
const TLUtils = require('../../src/lib/util')
const tlUtil = new TLUtils()

const BCH_QTY_ORIGINAL = 25.0
const TOKENS_QTY_ORIGINAL = 5000.0

const INCREMENT = 0.1
// let bchBalance = INCREMENT

// Map out the exchangeBCHForTokens() function
function runTest () {
  try {
    // Loop through linear increases in BCH.
    for (let i = INCREMENT; i < 10; i += INCREMENT) {
      const obj = {
        bchIn: INCREMENT,
        bchBalance: i,
        bchOriginalBalance: BCH_QTY_ORIGINAL,
        tokenOriginalBalance: TOKENS_QTY_ORIGINAL
      }

      const tokenInfo = lib.exchangeBCHForTokens(obj)

      console.log(`balance: ${i}, bchIn: ${INCREMENT}, tokensToSend: ${tokenInfo.tokensOut}, bch2: ${tokenInfo.bch2}, tokenBalance: ${tokenInfo.token2}`)
      // console.log(`${tlUtil.round8(i + INCREMENT)},${tlUtil.round8(tokenInfo.token2)},${tlUtil.round8(tokenInfo.tokensOut)}`)
    }
  } catch (err) {
    console.log(`Error in runTest(): `, err)
  }
}
runTest()
