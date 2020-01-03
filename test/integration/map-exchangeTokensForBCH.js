/*
  This isn't really a 'test'. Instead it maps out the values produced by the
  exchangeTokensForBCH() function so that they can be plotted in a spreadsheet
  and analyzed for errors.

  The output of this program can be compared to the bch-for-tokens sheet in the
  token-math-examples.ods spreadsheet.
*/

const TokenLiquidity = require('../../src/lib/token-liquidity')
const lib = new TokenLiquidity()

const BCH_QTY_ORIGINAL = 25.0
const TOKENS_QTY_ORIGINAL = 5000.0

// 2-d array. Format: [bchBalance, tokensIn]
const bchBalanceTokensIn = [
  [1364.95375082, 2000],
  [914.955861091, 2000],
  [613.313254927, 2000],
  [411.116169277, 2000],
  [275.579409516, 2000],
  [184.726402473, 2000],
  [123.825810609, 2000],
  [83.0029230684, 2000],
  [55.6385232123, 2000],
  [37.2956174410, 2000],
  [25, 2000],
  [16.7580011508, 2000],
  [11.2332241029, 2000],
  [7.52985529780, 2000],
  [5.04741294986, 2000],
  [3.38338208091, 2000]
]

// map out the exchangeTokensForBCH() function
function runTest () {
  try {
    // Loop through linear increases in BCH.
    for (let i = 0; i < bchBalanceTokensIn.length; i++) {
      const data = bchBalanceTokensIn[i]

      const bchBalance = data[0]
      const tokensIn = data[1]

      const obj = {
        tokenIn: tokensIn,
        bchBalance,
        bchOriginalBalance: BCH_QTY_ORIGINAL,
        tokenOriginalBalance: TOKENS_QTY_ORIGINAL
      }

      const bchOut = lib.exchangeTokensForBCH(obj)

      console.log(`bch1: ${bchBalance}, tokensIn: ${tokensIn}, bch2: ${bchOut.bch2}, bchOut: ${bchOut.bchOut}`)
    }
  } catch (err) {
    console.log(`Error in runTest(): `, err)
  }
}

runTest()
