var path=require('path')
var HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: './client/app/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
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
