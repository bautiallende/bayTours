// gulpfile.js

const { src, dest, watch, series } = require('gulp');
const sass = require('gulp-sass')(require('sass'));

function buildStyles() {
  return src('static/css/scss/main.scss')
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(dest('static/css/'));
}

function watchTask() {
  watch(['static/css/scss/*.scss'], buildStyles);
}

exports.default = series(buildStyles, watchTask);

