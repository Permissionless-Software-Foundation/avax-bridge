/*
  This isn't really a 'test'. Instead it maps out the values produced by the
  exchangeBCHForTokens() function so that they can be plotted in a spreadsheet
  and analyzed for errors.

  The output of this program can be compared to the tokens-for-bch sheet in the
  token-math-examples-old.ods spreadsheet.
*/

const TokenLiquidity = require('../../src/lib/token-liquidity')
const lib = new TokenLiquidity()

const BCH_QTY_ORIGINAL = 25.0
const TOKENS_QTY_ORIGINAL = 5000.0

// 2-d array. Format: [bchBalance, bchIn]
const bchBalanceBchIn = [
  [1, 1],
  [2, 1],
  [3, 2],
  [5, 3],
  [8, 2],
  [10, 5],
  [15, 5],
  [20, 5],
  [25, 5],
  [30, 5],
  [35, 5],
  [40, 5],
  [45, 5]
]

function runTest2 () {
  try {
    for (let i = 0; i < bchBalanceBchIn.length; i++) {
      const data = bchBalanceBchIn[i]

      const bchBalance = data[0]
      const bchIn = data[1]
      // console.log(`bchBalance: ${bchBalance}, bchIn: ${bchIn}`)

      const obj = {
        bchBalance: bchBalance,
        bchIn: bchIn,
        bchOriginalBalance: BCH_QTY_ORIGINAL,
        tokenOriginalBalance: TOKENS_QTY_ORIGINAL
      }

      const tokenInfo = lib.exchangeBCHForTokens(obj)

      console.log(
        `balance (bch1): ${bchBalance}, bchIn: ${bchIn}, token2: ${
          tokenInfo.token2
        }, tokenOut: ${tokenInfo.tokensOut}, bch2: ${tokenInfo.bch2}`
      )
    }
  } catch (err) {
    console.error('Error in runTest2: ', err)
  }
}
runTest2()
