const gulp = require('gulp');
const clean = require('gulp-clean');
const uglify = require('gulp-uglify');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('gulp-cssnano');
const rimraf = require('rimraf').sync;
const browser = require('browser-sync');
const nunjucksRender = require('gulp-nunjucks-render');
const htmlbeautify = require('gulp-html-beautify');
const concat = require('gulp-concat');
const port = process.env.SERVER_PORT || 8080;
const jsVendorsPath = 'source/js/vendors/';

// Starts a BrowerSync instance
gulp.task('server', ['build'], function () {
  browser.init({server: './build', port: port});
});

// Watch files for changes
gulp.task('watch', function () {
  gulp.watch('source/scss/**/*', ['compile-scss', browser.reload]);
  gulp.watch('source/js/**/*', ['copy-js', 'compile-js', browser.reload]);
  gulp.watch('source/images/**/*', ['copy-images', browser.reload]);
  gulp.watch('source/fonts/**/*', ['copy-fonts', browser.reload]);
  gulp.watch('source/html/pages/**/*', ['compile-html']);
  gulp.watch(['source/html/{includes,pages}/**/*'], ['compile-html:reset', 'compile-html', browser.reload]);
});

// Erases the dist folder
gulp.task('clean', function () {
  rimraf('build');
});

// Compile Theme Scss
gulp.task('compile-scss', function () {
  let plugins = [
    autoprefixer({browsers: ['last 4 versions']})
  ];
  //Watch me get Sassy
  return gulp.src('./source/scss/main.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(postcss(plugins))
    .pipe(cssnano())
    .pipe(sourcemaps.write(''))
    .pipe(gulp.dest('build/assets/css/'));
});

// Compile Html
gulp.task('compile-html', function() {
  return gulp.src('source/html/pages/**/*.+(html|nunjucks)')
    .pipe(nunjucksRender({
      path: ['source/html']
    }))
    .pipe(htmlbeautify({indentSize: 0, maxPreserveNewlines: 2,}))
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
    jsVendorsPath + 'aos/aos.js',
    jsVendorsPath + 'popper/popper.min.js',
    jsVendorsPath + 'smooth-scroll/smooth-scroll.min.js',
    jsVendorsPath + 'tweenmax/TweenMax.min.js',
    jsVendorsPath + 'scrollmagic/ScrollMagic.min.js',
    jsVendorsPath + 'tweenmax/animation.gsap.min.js',
    jsVendorsPath + 'bootstrap/bootstrap.min.js',
    jsVendorsPath + 'swiper/swiper.min.js',
    jsVendorsPath + 'font-awesome/fontawesome-all.min.js',
    jsVendorsPath + 'parallax/parallax.min.js',
    jsVendorsPath + 'fancybox/jquery.fancybox.min.js',
    'source/js/main.js',
  ])
    .pipe(concat('main.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./build/assets/js/'));
});

//Copy js to production site
gulp.task('copy-js', function () {
  gulp.src('source/js/pages/**/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('./build/assets/js/pages'));
});

//Copy fonts to production site
gulp.task('copy-fonts', function () {
  gulp.src('source/fonts/**/*')
    .pipe(gulp.dest('./build/assets/fonts'));
});

//Copy images to production site
gulp.task('copy-images', function () {
  gulp.src('source/images/**/*')
    .pipe(gulp.dest('./build/assets/images/'));
});


gulp.task('build', ['clean', 'compile-js', 'copy-js', 'compile-scss', 'compile-html', 'copy-images', 'copy-fonts']);
gulp.task('default', ['server', 'watch']);
