const gulp = require('gulp')
const eslint = require('gulp-eslint')
const browsersynch = require('browser-sync')
const nodemon = require('gulp-nodemon')
const gutil = require('gulp-util')
const watch = require('gulp-watch')
const browserRefreshDelay = 2000//on this box 1 second doesn't always work
const webpack = require('webpack')
const FileCache = require('gulp-file-cache')
const del = require('del')
const mocha = require('gulp-mocha')
const stylus = require('gulp-stylus')
const styleLint = require('gulp-stylelint')
const karma = require('karma')

gulp.task('stylus', () => {
  gulp.src('client/styles/playerStyle.styl')
  .pipe(stylus())
  .pipe(gulp.dest('dist/public'))
  .on('error', handleError)
})

gulp.task('lintcss', ['stylus'], () => {
  gulp.src('dist/public/playerStyle.css')
  .pipe(styleLint({
    reporters: [
      {formatter: 'string', console: true}
    ]
  }))
})




function handleError(err) {
  //console.log(err)
  this.emit('end')
}

const runKarma = (done, singleRun=true) => {
  new karma.Server({
    configFile: __dirname + '/karma.conf.js',
    singleRun: singleRun
  }, done).start()
}


gulp.task('testclient', ['lintclient'], runKarma)
  //gulp.src('client/tests/**/*test.js').
  //pipe(mocha({require: ['babel-core/register', 'client/tests/setup.js']}))
  //.on('error', handleError)
  /*.once('end', cb)
  .once('error', cb)*/ //for whatever reason, the pipe never seems to finish, so it's hard to identify when
  //the tests have fully run


gulp.task('testserver', ['lintserver'], () => {
  gulp.src('server/tests/**/*test.js').
  pipe(mocha({require: ['babel-core/register', 'server/tests/setup.js']}))
  .on('error', handleError)
  /*.once('end', cb)
  .once('error', cb)*/ //for whatever reason, the pipe never seems to finish, so it's hard to identify when
  //the tests have fully run
})

gulp.task('testprep', ['lintprep'], () => {
  gulp.src('prep/tests/**/*test.js').
  pipe(mocha({require: ['babel-core/register']}))
  .on('error', handleError)
})

gulp.task('test', ['testclient', 'testserver', 'testprep'])

gulp.task('copydataandfiles', ['cleandata'], () => {
  gulp.src('client/data/**')
  .pipe(gulp.dest('dist/public/data'))
  gulp.src('client/resources/**')
  .pipe(gulp.dest('dist/public/'))
})


gulp.task('cleandata', () => {
  //let paths =
  del.sync(['dist/public/data/**', 'dist/public/data'])
  //console.log('deleted: \n' + paths.join('\n'))
})

function runwebpack(configFile, desc, cb) {
  webpack(require(configFile), (err, status) => {
    if(err) throw new gutil.PluginError(desc, err)
    gutil.log(`[${desc}]`, status.toString({
      // output options
    }))
    cb()
  })
}

gulp.task('webpackclient', (cb) => {
  runwebpack('./webpack.config.js', 'webpackclient', cb)
})

gulp.task('webpackserver', (cb) => {
  runwebpack('./webpack.config.server.js', 'webpackserver', cb)
})

gulp.task('webpack', ['webpackclient', 'webpackserver', 'stylus'])

let clientFileCache = new FileCache //used to limit linting to files that have changed
gulp.task('lintclient', () => {
    // ESLint ignores files with "node_modules" paths.
    // So, it's best to have gulp ignore the directory as well.
    // Also, Be sure to return the stream from the task;
    // Otherwise, the task may end before the stream has finished.
  return gulp.src(['client/**/*.js','!node_modules/**'])
      .pipe(clientFileCache.filter())
      // eslint() attaches the lint output to the "eslint" property
      // of the file object so it can be used by other modules.
      .pipe(eslint())
      // eslint.format() outputs the lint results to the console.
      // Alternatively use eslint.formatEach() (see Docs).
      .pipe(eslint.format())
      // To have the process exit with an error code (1) on
      // lint error, return the stream and pipe to failAfterError last.
//      .pipe(eslint.failAfterError())
      .pipe(clientFileCache.cache())
})

let serverFileCache = new FileCache
gulp.task('lintserver', () => {
  return gulp.src(['server/**/*.js','!**/node_modules/**'])
      .pipe(serverFileCache.filter())
      .pipe(eslint())
      .pipe(eslint.format())
      //.pipe(eslint.failAfterError())
      .pipe(serverFileCache.cache())
})

let prepFileCache = new FileCache
gulp.task('lintprep', () => {
  return gulp.src(['prep/**/*.js','!**/node_modules/**'])
      .pipe(prepFileCache.filter())
      .pipe(eslint())
      .pipe(eslint.format())
      //.pipe(eslint.failAfterError())
      .pipe(prepFileCache.cache())
})

gulp.task('lint', ['lintclient', 'lintserver', 'lintprep', 'lintcss'])

gulp.task('watchkarma', () => {
  runKarma((f)=>f, false)
})

gulp.task('watch', ['watchkarma'], () => {
  watch(['client/styles/**/*'], () => gulp.start(['stylus']))
  watch(['client/app/**/*','client/index.html','!node_modules/**'], () => {
    gulp.start(['clearscreen', 'lintclient', 'webpackclient'])
  })
  watch(['dist/public/*'], () => {
    browsersynch.reload({stream: false})
  })
  watch(['client/resources/**'], () => gulp.start(['copydataandfiles']))

})

gulp.task('clearscreen', () => {
  console.log('\n'.repeat(10))
  console.log('='.repeat(40))
})

gulp.task('serve', ['webpack','lint','watch', 'copydataandfiles'], (cb) => {
  var called = false
  return nodemon({
    script: 'dist/server/server.js',
    watch: ['server/**/*.js'],
    tasks: ['webpackserver', 'lintserver']
  }).on('start', () => {
    if(!called) { cb()}
    called=true
  }).on('restart', () => {
    setTimeout(() => {
      browsersynch.reload({stream: false})
    }, browserRefreshDelay)
  })
})

gulp.task('launchbrowser', ['serve'], () => {
  browsersynch.init({
    reloadDebounce: 2000, //I don't think that these are both necessary
    reloadThrottle: 1000,
    proxy: 'http://localhost:8000',
    port: 8888
  })
})

gulp.task('default', ['launchbrowser'])


//webpack streams

/*
var gulp = require('gulp');
var webpack = require('webpack-stream');
gulp.task('default', function() {
  return gulp.src('src/entry.js')
    .pipe(webpack())
    .pipe(gulp.dest('dist/'));
});*/
