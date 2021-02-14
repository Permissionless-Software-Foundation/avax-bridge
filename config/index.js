const common = require('./env/common')
const bchjs = require('./bchjs')

const env = process.env.TL_ENV || 'development'
console.log(`Starting ${env} environment`)

const config = require(`./env/${env}`)
config.env = env

const macroConfig = Object.assign({}, bchjs, common, config)
// console.log('macroConig: ', macroConfig)

module.exports = macroConfig
