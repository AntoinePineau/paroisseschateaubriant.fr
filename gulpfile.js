const gulp = require('gulp');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const sass = require('gulp-sass')(require('sass'));
const htmlExtend = require('gulp-html-extend');
const browserSync = require('browser-sync').create();
const reload = ()=>{
  console.log("watch hit");
  browserSync.reload;
}
// Task to build the HTML files with includes
gulp.task('html', () => {
  return gulp.src('src/html/*.html')
    .pipe(htmlExtend({annotations:true, verbose:true}))
    .pipe(gulp.dest('dist'))
    .pipe(browserSync.stream());
});

// Task to build the SCSS files into concatenated and minified CSS
gulp.task('scss', () => {
  return gulp.src('src/scss/main.scss')
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(concat('main.min.css'))
    .pipe(gulp.dest('dist/css'))
    .pipe(browserSync.stream({match: '**/*.css'}));
});

// Task to build and minify JavaScript files
gulp.task('js', () => {
  return gulp.src(['src/js/lib/mavo.js', 'src/js/lib/mavo-locale-fr.js', 'src/js/main.js'])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'))
    .pipe(browserSync.stream());
});

gulp.task('copy-css-map', () => {
  return gulp.src('src/scss/lib/maps/mavo.css.map')
    .pipe(gulp.dest('dist/css/lib/maps'));
})

gulp.task('copy-js-map', () => {
  return gulp.src('src/js/lib/maps/mavo.js.map')
    .pipe(gulp.dest('dist/js/lib/maps'));
})

gulp.task('copy-img', () => {
  return gulp.src('src/img/*')
    .pipe(gulp.dest('dist/img/'));
})

gulp.task('copy-files', gulp.series(['copy-css-map', 'copy-js-map', 'copy-img']));

// Task to serve the development environment
gulp.task('serve', () => {
  browserSync.init({
    injectChanges: true,
    server: {
      baseDir: './dist',
    },
    socket: {
      domain: "localhost:3000"
    },
    open: false
  });
 
  gulp.watch('src/html/**/*.html', gulp.series('html')).on('change', reload);
  gulp.watch('src/scss/**/*.scss', gulp.series('scss')).on('change', reload);
  gulp.watch('src/js/**/*.js', gulp.series('js')).on('change', reload);
  gulp.watch('gulpfile.js').on('change', reload);
});

// Default task
gulp.task('default', gulp.series('html', 'scss', 'js', 'copy-files', 'serve'));
