const path=require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const common=require('./webpack.config.common.js')

module.exports = Object.assign({}, common,{
  devtool: '#source-map',
  entry: './client/app/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist/public'),
    sourceMapFilename: 'bundle.map'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'client/index.html',
      filename: 'index.html',
      inject: 'body' //options are true/body, head, and false
    })
  ]
})
