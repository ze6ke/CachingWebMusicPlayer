module.exports = {
  //devtool: '#source-map',
  //devtool: 'inline-source-map',
  externals:{
    'react/addons': 'react/addons',
    'react/lib/ReactContext': 'react/lib/ReactContext',
    'react/lib/ExecutionEnvironment': 'react/lib/ExecutionEnvironment',
    'react-addons-test-utils': 'react-addons-test-utils'
  },
  module: {
    rules: [
      { test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['es2015', 'react', 'stage-3']
          }
        }
      }
    ]
  }
}
