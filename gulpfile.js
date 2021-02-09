let path_source = "src/",
	path_dist = "dist/",
	path = {
		src: {
			html: path_source,
			css: path_source + 'scss/',
			js: path_source + 'js/',
			images: path_source + 'images/',
			fonts: path_source + 'fonts/'
		},
		watch: {
			html: path_source + '**/*.pug',
			css: path_source + 'scss/**/*.scss',
			js: path_source + 'js/**/*.js',
			images: path_source + 'images/*',
			fonts: path_source + 'fonts/*'
		},
		build: {
			html: path_dist,
			css: path_dist,
			js: path_dist + 'js/',
			images: path_dist + 'images/',
			fonts: path_dist + 'fonts/'
		},
		clean: "./" + path_dist
	};

	let { src, dest } = require('gulp'),
		gulp = require('gulp'),
		browserSync = require('browser-sync').create(),
		del = require('del'),
		pug2html = require('gulp-pug'),
		plumber = require('gulp-plumber'),
		sass = require('gulp-sass'),
		autoprefixer = require('gulp-autoprefixer'),
		csscomb	= require('gulp-csscomb'),
		gcmq = require('gulp-group-css-media-queries'),
		clean_css = require('gulp-clean-css'),
		rename = require('gulp-rename'),
		imagemin = require('gulp-imagemin'),
		sourcemaps = require('gulp-sourcemaps');


function configBrowserSync(params) {
	browserSync.init({
		server: {
			baseDir: './' + path_dist
		},
		port: 3000,
		notify: false
	})
}

function html() {
	return src(path.src.html + '*.pug')
			.pipe(plumber())
			.pipe(pug2html({
				pretty: true
			}))
			.pipe(gulp.dest(path.build.html))
			.pipe(browserSync.stream());
}

function css() {
	return src(path.src.css + '**/*.scss')
			.pipe(sourcemaps.init())
			.pipe(sass({
				outputStyle: 'expanded'
			}).on('error', sass.logError))
			.pipe(gcmq('.csscomb.json'))
			.pipe(csscomb())
			.pipe(sourcemaps.write())
			.pipe(gulp.dest(path.build.css))
			.pipe(browserSync.stream())
			.pipe(clean_css())
			.pipe(autoprefixer({
				overrideBrowserslist : ['last 2 versions'],
				cascade: true
			}))
			.pipe(rename({
				extname: ".min.css"
			}))
			.pipe(gulp.dest(path.build.css))
			.pipe(browserSync.stream());
}

function js() {
	return src(path.watch.js)
			.pipe(gulp.dest(path.build.js))
			.pipe(browserSync.stream());
}

function images() {
	return src(path.watch.images)
			.pipe(imagemin({
				progressive: true,
				svgoPlugins: [{ removeViewBox: false}],
				interlaced: true,
				optimizationLevel: 3
			}))
			.pipe(gulp.dest(path.build.images))
			.pipe(browserSync.stream());
}

function fonts() {
	return src(path.watch.fonts)
			.pipe(gulp.dest(path.build.fonts))
			.pipe(browserSync.stream());
}

function watchFiles(params) {
	gulp.watch([path.watch.html], html);
	gulp.watch([path.watch.css], css);
	gulp.watch([path.watch.js], js);
	gulp.watch([path.watch.images], images);
	gulp.watch([path.watch.fonts], fonts);
}

function clean(params) {
	return del(path.clean)
}

let build = gulp.series(clean, gulp.parallel(fonts, images, js, css, html));
let watch = gulp.parallel(build, watchFiles, configBrowserSync);

exports.fonts = fonts;
exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;