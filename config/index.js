const common = require('./env/common')
const bchjs = require('./bchjs')

const env = process.env.APP_ENV || 'development'
console.log(`Starting ${env} environment`)
const config = require(`./env/${env}`)
config.env = env

module.exports = Object.assign({}, bchjs, common, config)
