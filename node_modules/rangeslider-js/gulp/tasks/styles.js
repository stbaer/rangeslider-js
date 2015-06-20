var gulp = require('gulp');
var plugins = require("gulp-load-plugins")();
var sourcemaps = require('gulp-sourcemaps');
var filter = require('gulp-filter');
var browserSync = require('browser-sync');

gulp.task('styles', function () {

    return gulp.src([
        './src/styles/base.less'
    ])
        .pipe(sourcemaps.init())
        .pipe(plugins.less())
        .pipe(plugins.rename(function (path) {
            path.basename = 'rangeslider-js';
        }))
        .pipe(plugins.autoprefixer())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(paths.out))
        .pipe(plugins.csso())
        .pipe(plugins.rename(function (path) {
            path.basename += '.min';
        }))
        .pipe(plugins.size({
            showFiles: true
        }))
        .pipe(plugins.size({
            gzip: true,
            showFiles: true
        }))
        .pipe(gulp.dest(paths.out))
        .pipe(filter('**/*.css'))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('styles', function () {

    return gulp.src([
        './src/styles/base.less'
    ])
        .pipe(sourcemaps.init())
        .pipe(plugins.less())
        .pipe(plugins.rename(function (path) {
            path.basename = 'rangeslider-js';
        }))
        .pipe(plugins.autoprefixer())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(paths.out))
        .pipe(plugins.csso())
        .pipe(plugins.rename(function (path) {
            path.basename += '.min';
        }))
        .pipe(plugins.size({
            showFiles: true
        }))
        .pipe(plugins.size({
            gzip: true,
            showFiles: true
        }))
        .pipe(gulp.dest(paths.out))
        .pipe(filter('**/*.css'))
        .pipe(browserSync.reload({stream: true}));
});
