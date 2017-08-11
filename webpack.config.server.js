const path=require('path')
const common=require('./webpack.config.common.js')
const fs=require('fs')

const nodeModuleList = fs.readdirSync('node_modules')
  .filter(function(x) {
    return '.bin'!== x
  })

const externals = nodeModuleList.reduce((acc, el)=> {
  acc[el] = 'commonjs ' + el
  return acc
}, {})


module.exports = Object.assign({}, common, {
  entry: './server/server.js',
  output: {
    filename: 'server.js',
    path: path.resolve(__dirname, 'dist/server'),
    sourceMapFilename: 'server.map'
  },
  node: {
    __dirname: false
  },
  externals: externals,
  plugins: [
  ]
})
