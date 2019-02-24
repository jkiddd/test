"use strict"; // подсказки в консоли при ошибках

const gulp          = require('gulp');

const sass          = require('gulp-sass');    // компилирует sass
const sourcemaps    = require('gulp-sourcemaps'); // создает sourcemaps
const autoprefixer  = require('gulp-autoprefixer'); // для добавления префиксов

const wiredep       = require('wiredep').stream; //автоматическое подключение файлов из bower
const rename        = require('gulp-rename'); // переименование файлов
const concat        = require('gulp-concat');  // конкатенации файлов
const browserSync   = require('browser-sync'); // виртуальный сервер
const del           = require('del');  // удаление файлов/директорий

const useref        = require('gulp-useref'); //перенос файлов на продакшн
const gulpif        = require('gulp-if');     //фильтрует подключенные к index.html файлы
const uglify        = require('gulp-uglify'); //минификация js
const csso          = require('gulp-csso'); //минификация css
const lazypipe      = require('lazypipe'); //для задачи в задаче


// ============ компиляция sass ============
gulp.task('sass', function() {
    return gulp.src('app/sass/style.scss')  //находим наш файл стилей
        .pipe(sourcemaps.init())      // создаем sourcemaps
        .pipe(sass().on('error', sass.logError))  // преобразуем Sass в CSS посредством gulp-sass
        .pipe(autoprefixer([                     // создаем префиксы
            'last 15 versions',
            '> 1%',
            'ie 9',
            'ie 10']
        ))
        .pipe(sourcemaps.write())   // записываем изменения в soursemaps
        .pipe(gulp.dest('app/css')) // выгружаем результата в папку app/css
        .pipe(browserSync.reload({stream: true})); // обновляем CSS на странице при изменении
});


// ============ запуск Browser Sync ============
gulp.task('browser-sync', function() { // создаем таск browser-sync
    browserSync({ // выполняем browserSync
        server: { // определяем параметры сервера
            baseDir: 'app' // директория для сервера - app
        },
        notify: false // отключаем уведомления
    });
});


// ============ автоматическое прописывание путей к файлам Bower ============
gulp.task('bower', function () {
  gulp.src('app/index.html')
    .pipe(wiredep({
      directory : 'app/bower_components/'
    }))
    .pipe(gulp.dest('app/'));
});


// ============ слежение за изменениями в файлах ============
gulp.task('watch', ['browser-sync', 'sass'], function() {
    gulp.watch('bower.json', ['bower']);                // bower
    gulp.watch('app/sass/**/*.scss', ['sass']);         // sass
    gulp.watch('app/js/**/*.js', browserSync.reload);   // js
    gulp.watch('app/*.html', browserSync.reload);       // html
});



// ============ очистка папки DIST перед боевой сборкой ============
gulp.task('clean', function() {
    return del('dist'); // удаляем папку dist перед сборкой
});

// ============ сборка в DIST ============
gulp.task('build', ['clean'], function () {
    var buildFonts = gulp.src('app/fonts/**/*') // переносим шрифты в продакшен
        .pipe(gulp.dest('dist/fonts'))

    var buildImg = gulp.src('app/img/**/*') // переносим картинки в продакшен
        .pipe(gulp.dest('dist/img'))

    return gulp.src('app/*.html')
        .pipe(useref())
        .pipe(gulpif('*.js', uglify())) //минифицируем js
        // старт sourceMap для css
        .pipe(useref({}, lazypipe().pipe(sourcemaps.init, { loadMaps: true })))
        .pipe(gulpif('*.css', csso())) //минифицируем css
        .pipe(sourcemaps.write()) // запись sourceMap для css
        .pipe(gulp.dest('dist'));
});