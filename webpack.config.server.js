const path=require('path')
const common=require('./webpack.config.common.js')
const fs=require('fs')
//const webpack=require('webpack')

var nodeModules = {}
fs.readdirSync('node_modules')
  .filter(function(x) {
    return ['.bin'].indexOf(x) === -1
  })
  .forEach(function(mod) {
    nodeModules[mod] = 'commonjs ' + mod
  })

module.exports = Object.assign({}, common, {
  entry: './server/server.js',
  output: {
    filename: 'server.js',
    path: path.resolve(__dirname, 'dist/server'),
    sourceMapFilename: 'server.map'
  },
  externals: nodeModules,
  plugins: [
    //new webpack.IgnorePlugin(/\.(css|less)$/),
    //new webpack.BannerPlugin('require("source-map-support").install();',
    //                         { raw: true, entryOnly: false })
  ]
})
