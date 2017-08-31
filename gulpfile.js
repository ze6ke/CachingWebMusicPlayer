/*

x-lint once--nothing else
x-run unit tests once
x-run integration tests once--sass, webpack, start server, run webdriver, stop server
x-lint and run unit tests
x-run all tests once

x-serve for integration testing watching for changes
x-serve with browsersync watching for changes
x-run unit tests and watch for changes--independent
x-lint and watch for changes--independent
x-lint, unit test and watch for changes--default action
x-run integration tests and watch for changes--integration test should watch /dist/** + /*
run all tests and watch for changes
serve and run all tests and watch for changes

*/

const requiret=require('gulp-require-timer')

const gulp = requiret.require('gulp')
const FileCache = requiret.require('gulp-file-cache')

requiret.require('gulp-validated-src')(gulp)

const listTasks = requiret.require('gulp-task-listing')
gulp.task('help', listTasks)

const config = {
  client: {
    name: 'client',
    stagingPath: 'staging/client',
    finalPath: 'dist/public',
    karma: {
      configFile: __dirname + '/karma.conf.js'
    },
    sass: {
      source: 'client/styles/**/*.scss',
      target: 'staging/client/'
    },
    lintJs: {
      source: 'client/**/*.js',
      filecache: new FileCache
    },
    watchPath: ['client/app/**/*.js', 'client/index.html', 
      'client/styles/**/*.scss', 'client/resources'],
    webpack: './webpack.config.js'
  }, 
  server: {
    name: 'server',
    stagingPath: 'staging/server',
    finalPath: 'dist/server',
    webpack: './webpack.config.server.js',
    browserSynch: {
      refreshDelay: 2000,
      watchPath: ['dist/**/*', 'dist/public/style.css']
    },
    mocha: {
      source: 'server/tests/**/*test.js',
      requires: ['babel-core/register', 'server/tests/setup.js'],
      watchPath: ['server/**/*.js']
    },
    lintJs: {
      source: 'server/**/*.js',
      filecache: new FileCache
    },
    nodemon: {
      script: 'dist/server/server.js',
      watch: 'dist/server/server.js'
    }
  },
  prep: {
    stagingPath: 'client/data',
    libraryPaths: {
      small: 'prep/full/shortLibrary.json',
      large: 'prep/full/library.json',
      targetPath: 'prep/data/',
      targetName: 'library.json'
    },
    lintJs: {
      source: 'prep/**/*.js',
      filecache: new FileCache
    },
    mocha: {
      source: 'prep/tests/**/*test.js',
      requires: ['babel-core/register', 'server/tests/setup.js'],
      watchPath: ['prep/**/*.js']
    },
    finalPath: 'staging/client/data'
  },
  resources: {
    stagingPath: 'client/resources',
    finalPath: 'staging/client'
  },
  integration: {
    //scriptPath: 'integration_tests/index.js',
    mocha: {
      source: 'integration_tests/index.js',
      requires: [],
      watchPath: ['integration_tests/**/*.js']
    },
    watchPath: ['integration_tests/index.js', 'dist/**/*']
  }
}


requiret.notifications = false 
let nodemonHandle = null
let browserSynchHandle = null

gulp.task('unittest-client', runKarma(config.client, true))
gulp.task('unittest-server', runMocha(config.server))
gulp.task('unittest-prep', runMocha(config.prep))
gulp.task('unittest', ['unittest-client', 'unittest-server', 'unittest-prep'])

gulp.task('watchunittest-client', runKarma(config.client, false))
gulp.task('watchunittest-server', ['unittest-server'], watchMocha(config.server, ['unittest-server']))
gulp.task('watchunittest-prep', ['unittest-prep'], watchMocha(config.server, ['unittest-prep']))
gulp.task('watchunittest', ['watchunittest-client', 'watchunittest-server', 'watchunittest-prep'])

gulp.task('lint-css', lintCss(config.client))
gulp.task('lint-client', lintJs(config.client))
gulp.task('lint-server', lintJs(config.server))
gulp.task('lint-prep', lintJs(config.prep))
gulp.task('lint', ['lint-css', 'lint-client', 'lint-server', 'lint-prep'])

gulp.task('watchlint-client', ['lint-client'], watchLintJs(config.client, ['lint-client']))
gulp.task('watchlint-server', ['lint-server'], watchLintJs(config.server, ['lint-server']))
gulp.task('watchlint-prep', ['lint-prep'], watchLintJs(config.server, ['lint-prep']))
gulp.task('watchlint-css', ['lint-css'], watchLintCss(config.client, ['lint-css']))
gulp.task('watchlint', ['watchlint-css', 'watchlint-prep', 'watchlint-server', 'watchlint-client']) 


gulp.task('clearfiles-client', clearFiles(config.client))
gulp.task('clearfiles-server', clearFiles(config.server))

gulp.task('webpack-client', runWebpack(config.client))
gulp.task('webpack-server', runWebpack(config.server))
gulp.task('sass-client', runSass(config.client))

gulp.task('prestagefiles-data', stageFiles(config.prep))
gulp.task('prestagefiles-resource', stageFiles(config.resources))
//technically, clearfiles-client needs to run before webpack-client and sass-client
//but, it's fast, so this shouldn't be an issue and the code is much easier
//to read than the alternatives.
gulp.task('stagefiles-client', 
  ['clearfiles-client', 'webpack-client', 'sass-client', 'prestagefiles-data', 'prestagefiles-resource'], stageFiles(config.client))
gulp.task('stagefiles-server', ['clearfiles-server', 'webpack-server'], stageFiles(config.server))
gulp.task('stagefiles', ['stagefiles-server', 'stagefiles-client'])

gulp.task('launch-server', ['stagefiles'], runNodemon(config.server))
gulp.task('launch-server-nolog', ['stagefiles'], runNodemon(config.server, false))
gulp.task('watchlaunch-server', ['launch-server'], watchLaunchServer(config.client, ['stagefiles-client']))
gulp.task('watchlaunch-server-nolog', ['launch-server-nolog'], watchLaunchServer(config.client, ['stagefiles-client']))

gulp.task('integrationtest-subtask', runIntegrationTests(config.integration))
gulp.task('stop-server', stopServer())
gulp.task('integrationtest', prepRunAndShutdownIntegrationTests())

//this doesn't start the server yet
gulp.task('watchintegrationtest', ['watchlaunch-server-nolog'], watchIntegrationTests(config.integration, ['integrationtest-subtask']))

gulp.task('test', runAllTests)

gulp.task('default', ['watchunittest', 'watchlint'])

gulp.task('launch-browsersynch', ['watchlaunch-server'],launchBrowserSynch())
gulp.task('reload-browsersynch', reloadBrowserSynch())
gulp.task('watchbrowsersynch', ['watchlaunch-server', 'launch-browsersynch'], watchBrowserSynch(config.server, ['reload-browsersynch']))
gulp.task('preplibrary-small', prepLibrarySmall(config.prep))
gulp.task('pre-commit')

function prepLibrarySmall(settings) {
  const sourcePath = settings.libraryPaths.small
  const targetPath = settings.libraryPaths.targetPath
  const targetName = settings.libraryPaths.targetName

  return () => {
    const rename = requiret.require('gulp-rename')

    return gulp.src(sourcePath)
      .pipe(rename(targetName))
      .pipe(gulp.dest(targetPath))
  }
}

function launchBrowserSynch() {
  return () => {
    const browserSynch = requiret.require('browser-sync')
    browserSynchHandle = browserSynch

    browserSynch.init({
      reloadDebounce: 2000, //I don't think that these are both necessary
      reloadThrottle: 1000,
      proxy: 'http://localhost:8000',
      port: 8888,
      host: '192.168.1.11'
    })
  }
}

function watchBrowserSynch(settings, task) {
  const browserSynchWatchPath = settings.browserSynch.watchPath

  return () => {
    //the file operations that were getting done right before this were buffering
    //and triggering a flurry of event calls, this delay minimizes that.
    //That's also why the watch path was pushed up, because the directory was getting recreated
    //after the watch was registered and the watcher didn't find the new directory
    setTimeout( () => {
      watch(browserSynchWatchPath, task)()
    }, 1000)
  }
}

function reloadBrowserSynch() {
  return () => {
    browserSynchHandle && browserSynchHandle.reload({stream: false})
  }
}

function watchLaunchServer(clientSettings, task) {
  const clientWatchPath = clientSettings.watchPath

  return watch(clientWatchPath, task)
}

//this is sometimes executed twice, but should generally work
function watchIntegrationTests(settings, task) {
  return watch(settings.watchPath, task)
}

function prepRunAndShutdownIntegrationTests(settings) {

  return () => {
    const runSequence = requiret.require('run-sequence')

    runSequence('launch-server-nolog',
      'integrationtest-subtask',
      'stop-server'
    )
  }
}

function runIntegrationTests(settings) {
  return runMocha(settings)
/*  const scriptPath = settings.scriptPath

  return (cb) => {
    const {spawn} = requiret.require('child_process')
    const webdriverProc = spawn('node', [scriptPath])

    webdriverProc.on('close', () => cb())
  }
  */
}

function watchLintCss(settings, task) {
  return watch(settings.sass.source, task)
}

function watchLintJs(settings, task) {
  return watch(settings.lintJs.source, task)
}

function watchMocha(settings, task) {
  return watch(settings.mocha.watchPath, task)
}

function watch(watchPath, task) {
  return () => {
    gulp.watch(watchPath, task)
  }
}

function runAllTests()
{
  const runSequence = requiret.require('run-sequence')

  runSequence('unittest', 'integrationtest')
}

function runMocha(settings) {
  const source = settings.mocha.source
  const requires = settings.mocha.requires

  function handleError(err) {
    //console.log(err)
    this.emit('end')
  }

  return () => {
    const mocha = requiret.require('gulp-mocha')

    return gulp.srcN(source).
      pipe(mocha({require: requires}))
      .on('error', handleError)
  }
}

gulp.task('clearscreen', () => {
  console.log('\n'.repeat(80))
  console.log('='.repeat(80))
})

function runKarma(settings, singleRun = true) {
  const configFile = settings.karma.configFile

  return (cb) => {
    const karma = requiret.require('karma')
    new karma.Server({
      configFile,
      singleRun: singleRun
    }, cb).start()
  }
}


function lintJs(settings) {
  const source = settings.lintJs.source
  const filecache = settings.lintJs.filecache

  return () => {

    const eslint = requiret.require('gulp-eslint')
    // ESLint ignores files with "node_modules" paths.
    // So, it's best to have gulp ignore the directory as well.
    // Also, Be sure to return the stream from the task;
    // Otherwise, the task may end before the stream has finished.
    return gulp.srcN([source,'!node_modules/**'], 1)
      .pipe(filecache.filter())
    // eslint() attaches the lint output to the "eslint" property
    // of the file object so it can be used by other modules.
      .pipe(eslint())
    // eslint.format() outputs the lint results to the console.
    // Alternatively use eslint.formatEach() (see Docs).
      .pipe(eslint.format())
    // To have the process exit with an error code (1) on
    // lint error, return the stream and pipe to failAfterError last.
    //      .pipe(eslint.failAfterError())
      .pipe(filecache.cache())
  }
}

function lintCss(settings) {
  const source = settings.sass.source

  return () => {
    const styleLint = requiret.require('gulp-stylelint')

    gulp.srcN(source, 1)
      .pipe(styleLint({
        reporters: [
          {formatter: 'string', console: true}
        ]
      }))
  }
}

function notImplemented(name) { //eslint-disable-line no-unused-vars
  const thisName = name
  return () => {
    console.error(`${thisName} not implemented!!!`)
  }
}

function stageFiles(settings) {
  const source = settings.stagingPath + '/**'
  const destination = settings.finalPath

  return () => {
    gulp.srcN(source, 1)
      .pipe(gulp.dest(destination))
  }
}

function clearFiles(settings) {
  const target = [settings.finalPath, settings.finalPath + '/**']

  return () => {
    const del = requiret.require('del')
    del.sync(target)
  }
}

function runNodemon(settings, logging=true) {
  const script = settings.nodemon.script
  const watch = settings.nodemon.watch
  const browserSynchRefreshDelay = settings.browserSynch.refreshDelay
  const args = logging ? [] : ['--nolog']

  return (cb) => {
    const nodemon = requiret.require('gulp-nodemon')
    let taskReportedComplete = false
    nodemonHandle = nodemon({
      script,
      args,
      watch
    })
      .on('start', () => {
        browserSynchHandle && browserSynchHandle.reload({stream: false})

        if(!taskReportedComplete) {
          taskReportedComplete = true
          cb()
        }
      })
      .on('quit', () => {
        console.log('nodemon quit event emitted')
      })
      .on('restart', () => {
        console.log('nodemon restart event emitted')
        setTimeout( () => {
          browserSynchHandle && browserSynchHandle.reload({stream: false})
        }, browserSynchRefreshDelay)
      })
  }
}

function stopServer() {
  return () => {
    setTimeout(() => {
      nodemonHandle && nodemonHandle.emit('quit')//this stops my child process running under nodemon
      setTimeout(process.exit, 1000)//this is lame, but I couldn't find a way to get nodemon itself to quit
    }, 0)
  }
}

function runWebpack(settings) {
  const configFile = settings.webpack
  const desc = settings.name

  return (cb) => {
    const webpack = requiret.require('webpack')
    const gutil = requiret.require('gulp-util')
    webpack(require(configFile), (err, status) => {
      if(err) throw new gutil.PluginError(desc, err)
      gutil.log(`[${desc}]`, status.toString({
        // output options
      }))
      cb()
    })
  }
}


function runSass (settings) {
  const stylesheets = settings.sass.source
  const target = settings.sass.target
  return () => {
    const sass = requiret.require('gulp-sass')
    const sourcemaps = requiret.require('gulp-sourcemaps')

    return gulp.srcN(stylesheets, 1)
      .pipe(sourcemaps.init())
      .pipe(sass({sourceComments: 'map'}).on('error', sass.logError))
      .pipe(sourcemaps.write())
      .pipe(gulp.dest(target))
  }
}

