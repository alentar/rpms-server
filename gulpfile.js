'use strict'

const gulp = require('gulp')
const nodemon = require('gulp-nodemon')
const eslint = require('gulp-eslint')
const mocha = require('gulp-mocha')
const apidoc = require('gulp-apidoc')
const seq = require('run-sequence')

gulp.task('nodemon', () => {
  nodemon({
    script: 'src/index.js',
    ext: 'js',
    ignore: ['node_modules/**', 'docs/**'],
    env: { 'NODE_ENV': 'dev' }
  }).on('restart', function (files) {
    console.log('App restarted due to: ', files)
  })
})

gulp.task('test', () => {
  return gulp.src(['./test/*.js'], { read: false })
    .pipe(mocha({
      reporter: 'spec',
      exit: true
    }))
    .once('error', err => {
      console.error(err)
      process.exit(1)
    })
    .once('end', () => {
      process.exit()
    })
})

gulp.task('lint', () => {
  return gulp.src(['src/**/*.js', '!docs/**', '!node_modules/**'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
})

gulp.task('apidoc', (done) => {
  apidoc({
    src: './src/',
    dest: 'docs/docs',
    config: './',
    excludeFilters: [ 'node_modules', 'docs' ]
  }, done)
})

gulp.task('watch', () => {
  gulp.watch([ '!node_modules/', '!docs/', 'src/**/*.js' ], [ 'lint' ])
})

gulp.task('default', (cb) => {
  seq('nodemon', 'lint', cb)
})
