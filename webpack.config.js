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
//module.exports.module.rules[0].use.options.plugins = ['inferno']
/*
module.exports = {
  entry: './client/app/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist/public'),
    sourceMapFilename: 'bundle.map'
  },
  devtool: '#source-map',
  module: {
    rules: [
      { test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['es2015']//could add 'react' here
            ,plugins: ['inferno']
          }
        }
      }
    ]
  },
  //watch: false,
  watchOptions:{
    ignored: 'node_modules',
    aggregateTimeout: 300,
    poll: 1000
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'client/index.html',
      filename: 'index.html',
      inject: 'body' //options are true/body, head, and false
    })
  ]
}
*/
