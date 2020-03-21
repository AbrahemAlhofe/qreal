const path = require('path');

const commonConfig = {
  entry : './src/index.js'
}

const clientConfig = Object.assign({
  target : 'web',
  output : {
    path: path.resolve(__dirname, './'),
    filename: 'qreal.web.js'
  }
}, commonConfig)

const serverConfig = Object.assign({
  target : 'node',
  output : {
    path: path.resolve(__dirname, './'),
    filename: 'qreal.js'
  }
}, commonConfig)

module.exports = [clientConfig, serverConfig]
