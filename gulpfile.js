const requiret = require('./requireTimer.js')
/* when possible, push the require statements into the actual task blocks, otherwise you incur the (potentially expensive) cost of loading
 * the files on every execution and invisibly
 */
const gulp = requiret.require('gulp')
const FileCache = requiret.require('gulp-file-cache')

requiret.notifications = false //the delay for the requires inside of tasks are displayed in the task execution time.  The ones above this line
                              //do not happen inside of a task so need to be displayed seperately.
const browserRefreshDelay = 2000//on this box 1 second doesn't always work

gulp.task('stylus', () => {
  const stylus = requiret.require('gulp-stylus')
  const autoprefixer = requiret.require('gulp-autoprefixer')
  gulp.src('client/styles/playerStyle.styl')
  .pipe(stylus())
  .pipe(autoprefixer({
    browsers: ['last 2 version'],
    cascade: false
  }))
  .pipe(gulp.dest('dist/public'))
  .on('error', handleError)
})

gulp.task('lintcss', ['stylus'], () => {
  const styleLint = requiret.require('gulp-stylelint')
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
  const karma = requiret.require('karma')
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
  const mocha = requiret.require('gulp-mocha')
  gulp.src('server/tests/**/*test.js').
  pipe(mocha({require: ['babel-core/register', 'server/tests/setup.js']}))
  .on('error', handleError)
  /*.once('end', cb)
  .once('error', cb)*/ //for whatever reason, the pipe never seems to finish, so it's hard to identify when
  //the tests have fully run
})

gulp.task('testprep', ['lintprep'], () => {
  const mocha = requiret.require('gulp-mocha')
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
  const del = requiret.require('del')
  //let paths =
  del.sync(['dist/public/data/**', 'dist/public/data'])
  //console.log('deleted: \n' + paths.join('\n'))
})

function runwebpack(configFile, desc, cb) {
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

gulp.task('webpackclient', (cb) => {
  runwebpack('./webpack.config.js', 'webpackclient', cb)
})

gulp.task('webpackserver', (cb) => {
  runwebpack('./webpack.config.server.js', 'webpackserver', cb)
})

gulp.task('webpack', ['webpackclient', 'webpackserver', 'stylus'])

let clientFileCache = new FileCache //used to limit linting to files that have changed
gulp.task('lintclient', () => {
  const eslint = requiret.require('gulp-eslint')
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
  const eslint = requiret.require('gulp-eslint')
  return gulp.src(['server/**/*.js','!**/node_modules/**'])
      .pipe(serverFileCache.filter())
      .pipe(eslint())
      .pipe(eslint.format())
      //.pipe(eslint.failAfterError())
      .pipe(serverFileCache.cache())
})

let prepFileCache = new FileCache
gulp.task('lintprep', () => {
  const eslint = requiret.require('gulp-eslint')
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

gulp.task('watch', () => {
  const browsersynch = requiret.require('browser-sync')
  const watch = requiret.require('gulp-watch')
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
  const browsersynch = requiret.require('browser-sync')
  const nodemon = requiret.require('gulp-nodemon')
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
  const browsersynch = requiret.require('browser-sync')
  browsersynch.init({
    reloadDebounce: 2000, //I don't think that these are both necessary
    reloadThrottle: 1000,
    proxy: 'http://localhost:8000',
    port: 8888,
    host: '192.168.1.11'
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
