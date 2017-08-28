/*
lint once--nothing else
run unit tests once--
run integration tests once--sass, webpack, start server, run webdriver, stop server
lint and run unit tests
run all tests once

serve for testing watching for changes
run unit tests and watch for changes
lint, unit test and watch for changes
run integration tests and watch for changes
run all tests and watch for changes
serve and run all tests and watch for changes

What about difference between client, server, and prep module?


subtasks:
sass
webpack
move files around 
*/

const config={
  client: {
    name: 'client',
    stagingPath: 'staging/client',
    finalPath: 'dist/public',
    karma: {
      glob:'',
      options: {
        configFile: __dirname + '/karma.conf.js'
      }
    },
    sass: {
      source: 'client/styles/**/*.scss',
      target: 'dist/public/'
    },
    lintjs: '',
    lintcss: '',
    webpack: './webpack.config.js'
  }, 
  server: {
    name: 'server',
    stagingPath: 'staging/server',
    finalPath: 'dist/server',
    webpack: './webpack.config.server.js',
    script: 'dist/server/server.js',
    watch: 'dist/server/server.js'
  },
  prep: {
    stagingPath: 'client/data',
    finalPath: 'dist/public/data'
  },
  resources: {
    stagingPath: 'client/resources',
    finalPath: 'dist/public'
    
  }
}

const requiret=require('gulp-require-timer')
const gulp = requiret.require('gulp')
requiret.require('gulp-validated-src')(gulp)


const listTasks = requiret.require('gulp-task-listing')
gulp.task('help', listTasks)


requiret.notifications = false 

gulp.task('unittest-client', runKarma(config.client))
gulp.task('unittest-server', runMocha(config.server))
gulp.task('unittest-prep', runMocha(config.prep))
gulp.task('unittest', ['unittest-client', 'unittest-server', 'unittest-prep'])


gulp.task('sass-client', runSass(config.client))
gulp.task('stagefiles-client', ['clearfiles-client', 'webpack-client', 'sass-client'], stageFiles(config.client))
gulp.task('stagefiles-server', ['clearfiles-server', 'webpack-server'], stageFiles(config.server))
gulp.task('stagefiles-data', ['clearfiles-client'], stageFiles(config.prep))
gulp.task('stagefiles-resource', ['clearfiles-client'], stageFiles(config.resources))
gulp.task('stagefiles', ['stagefiles-resource', 'stagefiles-data', 'stagefiles-server', 'stagefiles-client'])

gulp.task('clearfiles-client', clearFiles(config.client))
gulp.task('clearfiles-server', clearFiles(config.server))

gulp.task('webpack-client', runWebpack(config.client))
gulp.task('webpack-server', runWebpack(config.server))

let nodemonHandle = null

gulp.task('launchserver', ['stagefiles'], runNodemon(config.server))
gulp.task('integrationtest-subtask', ['launchserver'], notImplemented('integrationtest-subtask'))
gulp.task('integrationtest', ['webdrivertest'], stopServer())

function notImplemented(name) {
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

function runNodemon(settings) {
  const script = settings.script
  const watch = [settings.watch]

  return (cb) => {
    const nodemon = requiret.require('gulp-nodemon')
    let taskReportedComplete = false
    nodemonHandle = nodemon({
      script,
      watch
    })
      .on('start', () => {
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

function runMocha(settings) {
  return () => {
  }
}

function runKarma(settings) {
  return () => {
  }
}

