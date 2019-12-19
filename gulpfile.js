const {
  src, dest, parallel, series, watch,
} = require('gulp');

const uglify = require('gulp-uglify-es').default;
const browserSync = require('browser-sync').create();
const del = require('del');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const noop = require('gulp-noop');
const sass = require('gulp-sass');
const jsdoc = require('gulp-jsdoc3');
const eslint = require('gulp-eslint');
const sassLint = require('gulp-sass-lint');

function html() {
  return src('src/*.html')
    .pipe(dest('dist'));
}

function js(minify) {
  return src(['lib/*.js', 'src/*.js'])
    .pipe(sourcemaps.init())
    .pipe(minify ? uglify() : noop())
    .pipe(concat('all.js'))
    .pipe(dest('dist', { sourcemaps: !minify }));
}

function jslint() {
  return src(['*.js', 'src/*.js'])
    .pipe(eslint({
      configFile: '.eslintrc.js',
    }))
    .pipe(eslint.format());
}

function scsslint() {
  return src(['src/*.scss'])
    .pipe(sassLint())
    .pipe(sassLint.format());
}

function lint(done) {
  return parallel(jslint, scsslint)(done);
}

function jsmin() {
  return js(true);
}

function jsconcat() {
  return js(false);
}

function css(sourcemap) {
  return src('src/*.scss')
    .pipe(sourcemap ? sourcemaps.init() : noop())
    .pipe(sass())
    .pipe(dest('dist', { sourcemaps: sourcemap }));
}

function cssWithSourcemaps() {
  return css(true);
}

function cssWithoutSourcemaps() {
  return css(false);
}

function staticdir() {
  return src('static/*')
    .pipe(dest('dist'));
}

function docs(done) {
  return src(['README.md', './src/*.js'])
    .pipe(jsdoc(done));
}

function dev(done) {
  return parallel(html, cssWithSourcemaps, jsconcat, staticdir, lint, docs)(done);
}

function prod(done) {
  return parallel(html, cssWithoutSourcemaps, jsmin, staticdir)(done);
}

function serve(done) {
  browserSync.init({
    browser: 'chrome',
    server: {
      baseDir: './dist',
    },
  });
  done();
}

const clean = () => del(['dist']);

const dowatch = () => watch(['lib', 'src', 'static'], series(dev /* , reload */));

exports.clean = clean;
exports.dev = dev;
exports.prod = prod;
exports.lint = lint;
exports.serve = series(clean, dev, serve, dowatch);
exports.docs = docs;
