const common = require('./webpack.config.client.common.js')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')

let config = common

config.plugins.push(new UglifyJSPlugin())

module.exports = config
