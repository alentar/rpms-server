'use strict'

const gulp = require('gulp')
const nodemon = require('gulp-nodemon')
const eslint = require('gulp-eslint')
const mocha = require('gulp-mocha')
const apidoc = require('gulp-apidoc')
const seq = require('run-sequence')

gulp.task('nodemon', () => {
  nodemon({
    script: './src/index.js',
    ext: 'js',
    env: { 'NODE_ENV': 'dev' }
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
  return gulp.src(['src/**/*.js', '!public/**', '!node_modules/**'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
})

gulp.task('apidoc', (done) => {
  apidoc({
    src: './src/',
    dest: 'public/docs',
    config: './',
    excludeFilters: [ 'node_modules', 'public/docs' ]
  }, done)
})

gulp.task('watch', () => {
  gulp.watch([ '!node_modules/', 'src/**/*.js' ], ['lint', 'apidoc'])
})

gulp.task('default', (cb) => {
  seq('lint', 'apidoc', 'nodemon', cb)
})
