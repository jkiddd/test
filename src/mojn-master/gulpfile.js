
/**
 * Created by Kos on 24.04.2016.
 */
var gulp = require('gulp'),
    stylus = require('gulp-stylus'),
    sourcemaps = require('gulp-sourcemaps');


gulp.task('serve', function() {
    return gulp.watch('./src/css/*.styl', ['one']);
});

gulp.task('one', function () {
    return gulp.src('./src/css/main.styl')
        .pipe(sourcemaps.init())
        .pipe(stylus({
            compress: true
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./src/css/'));
});