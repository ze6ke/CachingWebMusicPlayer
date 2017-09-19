const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const common = require('./webpack.config.common.js')
const webpack = require('webpack')

module.exports = Object.assign({}, common,{
  devtool: 'source-map',
  entry: {
    main: './client/app/index.js',
    vendor: [// libraries listed in this array will be extracted from main and bundled separately.
      'react',
      'react-dom',
      'babel-polyfill'
    ]
  },
  output: {
    filename: '[name].[chunkhash].js',
    path: path.resolve(__dirname, 'staging/client'),
    sourceMapFilename: '[name].map'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'client/index.html',
      filename: 'index.html',
      inject: 'body' //options are true/body, head, and false
    }),
    new webpack.HashedModuleIdsPlugin(),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor'
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'runtime' //this doesn't show up in the entry section and will therefore just hold the runtime functions
    })
  ],
  externals: { //These are files that webpack will never put into the bundle
    /*'react/addons': 'react/addons',
    'react/lib/ReactContext': 'react/lib/ReactContext',
    'react/lib/ExecutionEnvironment': 'react/lib/ExecutionEnvironment',
    'react-addons-test-utils': 'react-addons-test-utils'*/
  }
})
