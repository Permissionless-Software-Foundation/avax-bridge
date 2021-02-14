const server = require('./bin/server.js')
const { startAvaxBridge } = require('./bin/avax-bridge')

async function startServer () {
  await server.startServer()
  await startAvaxBridge()
}

startServer()
