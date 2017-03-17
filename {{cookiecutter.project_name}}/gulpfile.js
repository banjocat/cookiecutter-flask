var gulp = require('gulp');
var less = require("gulp-less");
var rename = require('gulp-rename');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

// js files can't use wildcard
var jsfiles = [
    'static/commonjs/app.js'
];

var lessfiles = [
    'static/less/*.less'
];

gulp.task('less', function() {
    return gulp.src(lessfiles)
    .pipe(less())
    .on('error', function() {return;})
    .pipe(rename({dirname:''}))
    .pipe(gulp.dest('static/css'));
});

gulp.task('js', function() {
    return browserify()
    .add(jsfiles)
    .bundle()
    .on('error', function(e) { 
        console.log(e.message);
        this.emit('end');
    })
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('static/js'));
});

gulp.task('watch', function() {
    gulp.watch(lessfiles, ['less']);
    gulp.watch(jsfiles, ['js']);
});

// Workaround for https://github.com/gulpjs/gulp/issues/71
// Allows on error to work so no failing

function fixPipe(stream) {
    var origPipe = stream.pipe;
    stream.pipe = function (dest) {
        arguments[0] = dest.on('error', function (error) {
            var nextStreams = dest._nextStreams;
            if (nextStreams) {
                nextStreams.forEach(function (nextStream) {
                    nextStream.emit('error', error);
                });
            } else if (dest.listeners('error').length === 1) {
                throw error;
            }
        });
        var nextStream = fixPipe(origPipe.apply(this, arguments));
        (this._nextStreams || (this._nextStreams = [])).push(nextStream);
        return nextStream;
    };
    return stream;
}

var origSrc = gulp.src;
gulp.src = function () {
    return fixPipe(origSrc.apply(this, arguments));
};
