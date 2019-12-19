const { src, dest, parallel, series, watch } = require('gulp');

const uglify = require('gulp-uglify-es').default;
const browserSync = require('browser-sync').create();
const del = require('del');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const noop = require("gulp-noop");
const sass = require('gulp-sass');
const jsdoc = require('gulp-jsdoc3');

function html() {
  return src('src/*.html')
    .pipe(dest('dist'))
}

function js(minify) {
  return src(['lib/*.js', 'src/*.js'])
    .pipe(sourcemaps.init())
    .pipe(minify ? uglify() : noop())
    .pipe(concat('all.js'))
    .pipe(dest('dist', { sourcemaps: !minify }))
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
    .pipe(dest('dist', { sourcemaps: sourcemap }))
}

function css_with_sourcemaps() {
	return css(true);
}

function css_without_sourcemaps() {
	return css(false);
}
	

function staticdir() {
  return src('static/*')
    .pipe(dest('dist'))
}

function dev(done) {
    return parallel(html, css_with_sourcemaps, jsconcat, staticdir, docs)(done);
}

function prod(done) {
    return parallel(html, css_without_sourcemaps, jsmin, staticdir)(done);
}

function reload(done) {
  browserSync.reload();
  done();
}

function serve(done) {
  browserSync.init({
    browser: "chrome",
	server: {
        baseDir: "./dist"
	}
 });
 done();
}

function docs(done) {
  return src(['README.md', './src/*.js'])
    .pipe(jsdoc(done));
}

const clean = () => del(['dist']);

const dowatch = () => watch(["lib","src","static"], series(dev /* , reload */));

exports.clean = clean;
exports.dev = dev;
exports.prod = prod;
exports.serve = series(clean, dev, serve, dowatch);
exports.docs = docs;
