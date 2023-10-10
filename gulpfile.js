const gulp = require('gulp');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const sass = require('gulp-sass')(require('sass'));
const htmlExtend = require('gulp-html-extend');
const browserSync = require('browser-sync').create();
const through = require('through2');
const ssr = require('./ssr');
const path = require('path');
function reload(done){
  console.log('file changed', done);
  browserSync.reload();
}

// Task to build the HTML files with includes
gulp.task('html', () => {
  return gulp.src(['src/html/**/*.html', '!src/html/includes/*.html'])
    .pipe(htmlExtend({annotations:true, verbose:false}))
    .pipe(gulp.dest((file)=>{
      return file.base.replace('src/html', 'dist')
    }))
    .pipe(browserSync.stream());
});

// Task to build the SCSS files into concatenated and minified CSS
gulp.task('scss', () => {
  return gulp.src('src/res/scss/main.scss')  
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(concat('main.min.css'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist/res/css'))
    .pipe(browserSync.stream());
});

// Task to build and minify JavaScript files
gulp.task('js', () => {
  return gulp.src(['src/res/js/lib/mavo.js', 'src/res/js/lib/mavo-tinymce.js', 'src/res/js/lib/mavo-locale-fr.js', 'src/res/js/lib/mavo-cropper.js','src/res/js/lib/lunr.js', 'src/res/js/main.js'])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist/res/js'))
    .pipe(browserSync.stream());
});

// Tasks to directly copy files from src to dist
gulp.task('copy-css-map', () => {
  return gulp.src('src/res/scss/lib/maps/mavo.css.map')
    .pipe(gulp.dest('dist/res/css/lib/maps'));
});

gulp.task('copy-js-map', () => {
  gulp.src('src/res/js/lib/maps/mavo-offline.js.map')
      .pipe(gulp.dest('dist/res/js/lib/maps'));
  gulp.src('src/res/js/lib/mavo-offline.js')
      .pipe(gulp.dest('dist/res/js/lib'));
  return gulp.src('src/res/js/lib/maps/mavo.js.map')
    .pipe(gulp.dest('dist/res/js/lib/maps'));
});

gulp.task('copy-img', () => {
  return gulp.src('src/res/img/**/*')
    .pipe(gulp.dest('dist/res/img/'));
});

gulp.task('copy-fonts', () => {
  return gulp.src('src/res/webfonts/*')
    .pipe(gulp.dest('dist/res/webfonts/'));
});

gulp.task('copy-files', gulp.series(['copy-css-map', 'copy-js-map', 'copy-img', 'copy-fonts']));

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
  gulp.watch('src/html/**/*.html', gulp.series('html', 'copy-files')).on('change', reload);
  gulp.watch('src/res/scss/**/*.scss', gulp.series('scss', 'copy-files')).on('change', reload);
  gulp.watch('src/res/js/*.js', gulp.series('js', 'copy-files')).on('change', reload);
  gulp.watch('gulpfile.js', gulp.series('html', 'copy-files')).on('change', reload);
});

// Default task
gulp.task('default', gulp.series('html', 'scss', 'js', 'copy-files', 'serve'));

const gulpMavoSSR = (base) => {
	const staticPortPromise = ssr.makeStaticAppAndGetPort(base);

	return through.obj(async (file, encoding, callback) => {
		const staticPort = await staticPortPromise;
		const relBasePath = path.relative(base, file.path);
		let newFile = file.clone();
		const url = `http://localhost:${staticPort}/${relBasePath}`;
		const {content} = await ssr.render(url,{renderNonMavo: true});
		newFile.contents = Buffer.from(content);
		callback(null, newFile);
	});
};

gulp.task('ssr', () => {
	return gulp.src('**/*.html')
		.pipe(gulpMavoSSR('dist'))
		.pipe(gulp.dest('www'));
});
