const gulp = require('gulp');
const clean = require('gulp-clean');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('autoprefixer');
const mq4HoverShim = require('mq4-hover-shim');
const rimraf = require('rimraf').sync;
const browser = require('browser-sync');
const nunjucksRender = require('gulp-nunjucks-render');
const htmlbeautify = require('gulp-html-beautify');
const concat = require('gulp-concat');
const port = process.env.SERVER_PORT || 8080;
const jsVendorsPath = 'js/vendors/';

// Starts a BrowerSync instance
gulp.task('server', ['build'], function () {
  browser.init({server: './build', port: port});
});

// Watch files for changes
gulp.task('watch', function () {
  gulp.watch('scss/**/*', ['compile-scss', browser.reload]);
  gulp.watch('js/**/*', ['copy-js', browser.reload]);
  gulp.watch('images/**/*', ['copy-images', browser.reload]);
  gulp.watch('html/pages/**/*', ['compile-html']);
  gulp.watch(['html/{includes,pages}/**/*'], ['compile-html:reset', 'compile-html', browser.reload]);
});

// Erases the dist folder
// gulp.task('reset', function () {
//   rimraf('scss/*');
//   rimraf('images/*');
// });

// Erases the dist folder
gulp.task('clean', function () {
  rimraf('build');
});

// Compile Theme Scss
gulp.task('compile-scss', function () {
  const processors = [
    mq4HoverShim.postprocessorFor({hoverSelectorPrefix: '.is-true-hover '}),
    autoprefixer({
      browsers: [
        'Chrome >= 45',
        'Firefox ESR',
        'Edge >= 12',
        'Explorer >= 10',
        'iOS >= 9',
        'Safari >= 9',
        'Android >= 4.4',
        'Opera >= 30'
      ]
    })//,
    //cssnano(),
  ];
  //Watch me get Sassy
  return gulp.src('./scss/main.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./build/assets/css/'));
});

// Compile Html
gulp.task('compile-html', function() {
  return gulp.src('html/pages/**/*.+(html|nunjucks)')
    .pipe(nunjucksRender({
      path: ['html']
    }))
    .pipe(htmlbeautify({'indentSize': 2, 'max_preserve_newlines': '2',}))
    .pipe(gulp.dest('build'))
});

gulp.task('compile-html:reset', function (done) {
  done();
});

// Compile vendors js
gulp.task('compile-js', function () {
  return gulp.src([
    // Static js assets
    jsVendorsPath + 'jquery/jquery.min.js',
    jsVendorsPath + 'popper/popper.min.js',
    jsVendorsPath + 'bootstrap/bootstrap.min.js',
    jsVendorsPath + 'font-awesome/fontawesome-all.min.js',
    jsVendorsPath + 'swiper/swiper.min.js',
  ])
    .pipe(concat('main.js'))
    .pipe(gulp.dest('./build/assets/js/'));
});

//Copy js to production site
gulp.task('copy-js', function () {
  gulp.src([
    'js/pages/**/*.js',
  ])
    .pipe(gulp.dest('./build/assets/js/pages'));
});

//Copy images to production site
gulp.task('copy-images', function () {
  gulp.src('images/**/*')
    .pipe(gulp.dest('./build/assets/images/'));
});


gulp.task('build', ['clean', 'compile-js', 'copy-js', 'compile-scss', 'compile-html', 'copy-images']);
gulp.task('default', ['server', 'watch']);
