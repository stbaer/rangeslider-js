var plugins = require("gulp-load-plugins")();
var gulp        = require('gulp');
var source      = require('vinyl-source-stream');
var buffer      = require('vinyl-buffer');
var browserify  = require('browserify');
var watchify    = require('watchify');
var handleErrors = require('../util/handleErrors');

function rebundle() {
    return this.bundle()
        .on('error', handleErrors.handler)
        .pipe(handleErrors())
        .pipe(source('rangeslider-js.js'))
        .pipe(gulp.dest(paths.out))
        .pipe(buffer())
        .pipe(plugins.uglify())
        .pipe(plugins.rename({ suffix: '.min' }))
        .pipe(plugins.size({
            showFiles: true
        }))
        .pipe(plugins.size({
            gzip: true,
            showFiles: true
        }))
        .pipe(gulp.dest(paths.out));
}

function createBundler(args) {
    args = args || {};
    args.debug = true;
    args.standalone = 'rangesliderJs';

    return browserify(paths.jsEntry, args);
}

function watch(onUpdate) {
    var bundler = watchify(createBundler(watchify.args));

    bundler.on('update', function () {
        var bundle = rebundle.call(this);

        if (onUpdate) {
            bundle.on('end', onUpdate);
        }
    });

    return rebundle.call(bundler);
}

module.exports = function bundle() {
    return rebundle.call(createBundler());
};

module.exports.watch = watch;
module.exports.rebundle = rebundle;
module.exports.createBundler = createBundler;
