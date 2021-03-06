//const webpackConfig = require('./webpack.config.common.js')

// Karma configuration
// Generated on Sat May 13 2017 06:07:14 GMT+0000 (UTC)
//const merge = require('webpack-merge')

const webpackOptions = {
  devtool: 'inline-source-map',  
  //devtool: 'inline-source-map',  
  watch: true,
  externals: [//I don't understand why, but enzyme requires it
    'react/addons',
    'react/lib/ReactContext',
    'react/lib/ExecutionEnvironment',
    'react-addons-test-utils'
  ],
  module: {
    rules: [
      { 
        test: /\.js$/,
        exclude: /(node_modules)|(test)/,
        use: [
          {
            loader: 'istanbul-instrumenter-loader',
            query: {
              esModules: true
            }
          }]
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 
        {
          loader: 'babel-loader',
          options: {
            presets: ['es2015', 'react', 'stage-3']
          }
        } 
      }]
  }
}


module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha'],


    // list of files / patterns to load in the browser
    files: [
      'client/tests/all.test.js'

    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'client/tests/all.test.js': ['webpack', 'sourcemap'],
    },
    webpack: webpackOptions,

    webpackMiddleware: {
      // webpack-dev-middleware configuration
      // this supresses the feedback of what modules get included
      stats: 'errors-only'
      //stats: 'verbose'
    },
    phantomjsLauncher: {
      exitOnResourceError: true,
      debug: false
    }/*,
    plugins: [
      'karma-coverage-istanbul-reporter'
    ]*/,

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['mocha', 'coverage-istanbul'/*, 'coverage''html''dots'*/],
    coverageIstanbulReporter: {
      reports: ['html', 'text'],
      dir: 'coverage/'
    },
    coverageReporter: {//this reporter doesn't work for html
      //so I replaced it with coverage-istanbul, which seems to work
      type: 'lcov',
      dir: 'coveragen/'
    },
    mochaReporter: {
      output: 'full'//autowatch, minimal, noFailures
    },


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'/*, 'PhantomJS'*/],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
