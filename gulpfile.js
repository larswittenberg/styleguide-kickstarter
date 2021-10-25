var gulp = require('gulp'),
	sass = require('gulp-sass')(require('node-sass')),
	postcss = require('gulp-postcss'),
	autoprefixer = require('autoprefixer'),
	fileinclude = require('gulp-file-include'),
	del = require('del'),
	cssnano = require('cssnano'),
	sourcemaps = require('gulp-sourcemaps'),
	minify = require('gulp-babel-minify'),
	rename = require('gulp-rename'),
	inject = require('gulp-inject-string'),
	babel = require('gulp-babel'),
	concat = require('gulp-concat');

var browserSync = require('browser-sync').create();


// Path Variables
var paths = {
	styles: {
		src: 'src/scss/**/*.scss',
		dest: 'dist/css',
	},
	scripts: {
		src: ['src/js/*.*', 'src/js/components/*.*'],
		dest: 'dist/js/',
	},
	externalscripts: {
		src: 'src/js/ext/*.*',
		dest: 'dist/js/ext/',
	},
	templatefiles: {
		src: ['src/pages/**/*.*'],
		dest: 'dist/'
	},
	includefiles: {
		src: ['src/includes/**/*.html'],
	},
	staticfiles: {
		src: ['src/**/*.pdf', 'src/.htaccess'],
		dest: 'dist/'
	},
	fonts: {
		src: 'src/fonts/**/*.*',
		dest: 'dist/fonts/',
	},
	images: {
		src: 'src/images/**/*.*',
		dest: 'dist/images/'
	},
	videos: {
		src: 'src/videos/**/*.*',
		dest: 'dist/videos/'
	},
	animations: {
		src: 'src/animations/**/*.*',
		dest: 'dist/animations/'
	}
};


// TASK: Clean Assets
function clean() {
	return del(['dist']);
}



// TASK: Reload Browser
function reload() {
	browserSync.reload();
}



// TASK: Browser-Sync Serve
function serve(done) {
	browserSync.init({
		ghostMode: false, // disable synced scrolling
		server: {
			baseDir: './dist',
			// https://www.browsersync.io/docs/options#option-serveStaticOptions
			serveStaticOptions: {
				extensions: ['html'] // pretty urls
			}
		}
	});
	done();
}



// TASK: Styles
function style() {
	return gulp
		.src(paths.styles.src)
		.pipe(sourcemaps.init())
		.pipe(sass())
		.on('error', sass.logError)
		.pipe(postcss([autoprefixer({grid: 'autoplace'}), cssnano()]))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(paths.styles.dest))
		.pipe(browserSync.stream());
}
exports.style = style;



// TASK: Minify & Transpile JavaScript
function javascript() {
	return (
		gulp
			.src(paths.scripts.src)
			.pipe(concat('javascript.js'))
			.pipe(sourcemaps.init())
			.pipe(babel({
				presets: ['@babel/preset-env']
			}))
			.pipe(gulp.dest(paths.scripts.dest))
			.pipe(minify({
				mangle: {
				  keepClassName: true
				}
			}))
			.pipe(rename(function (path) {
				path.basename += '.min';
			}))
			.pipe(gulp.dest(paths.scripts.dest))
			.pipe(sourcemaps.write('.'))
			.pipe(gulp.dest(paths.scripts.dest))
			.pipe(browserSync.stream())
	);
}
exports.javascript = javascript;



// TASK: Copy External JavaScript to /dist/ext
function copyscripts() {
	return (
		gulp
			.src(paths.externalscripts.src, { sourcemaps: true })
			.pipe(gulp.dest(paths.externalscripts.dest, { sourcemaps: true }))
			.pipe(browserSync.stream())
	);
}
exports.copyscripts = copyscripts;



// TASK: Add / Update Build DateTime
function injectBuildDateTime() {
	const date = new Date();
	const dateoptions = { weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };
	let datetime = date.toLocaleDateString('de-DE', dateoptions);

	return gulp
		.src('src/pages/index.html')
		.pipe(
			fileinclude({
				prefix: '@@',
				basepath: 'src/includes/'
			})
		)
		.pipe(inject.replace('BUILDDATE', datetime))
		.pipe(gulp.dest(paths.templatefiles.dest));
}
exports.injectBuildDateTime = injectBuildDateTime;



// TASK: Copy Files + File-Includes to /dist
function copyfiles() {
	return gulp
		.src(paths.templatefiles.src)
		.pipe(
			fileinclude({
				prefix: '@@',
				basepath: 'src/includes/'
			})
		)
		.pipe(gulp.dest(paths.templatefiles.dest));
}
exports.copyfiles = copyfiles;



// TASK: Copy Static Files to /dist
function copystaticfiles() {
	return gulp
		.src(paths.staticfiles.src)
		.pipe(gulp.dest(paths.staticfiles.dest)
	);
}
exports.copystaticfiles = copystaticfiles;



// TASK: Copy Fonts to /dist
function copyfonts() {
	return (
		gulp
			.src(paths.fonts.src)
			.pipe(gulp.dest(paths.fonts.dest))
	);
}
exports.copyfonts = copyfonts;



// TASK: Copy Images to /dist
function copyimages() {
	return (
		gulp
			.src(paths.images.src)
			.pipe(gulp.dest(paths.images.dest))
	);
}
exports.copyimages = copyimages;



// TASK: Copy Videos to /dist
function copyvideos() {
	return (
		gulp
			.src(paths.videos.src)
			.pipe(gulp.dest(paths.videos.dest))
	);
}
exports.copyvideos = copyvideos;



// TASK: Copy Animations to /dist
function copyanimations() {
	return (
		gulp
			.src(paths.animations.src)
			.pipe(gulp.dest(paths.animations.dest))
	);
}
exports.copyanimations = copyanimations;



// TASK: Watch
function watch() {
	gulp.watch(paths.styles.src, gulp.series(style, injectBuildDateTime));
	gulp.watch(paths.scripts.src, gulp.series(javascript, injectBuildDateTime)).on('change', reload);
	gulp.watch(paths.externalscripts.src, copyscripts).on('change', reload);
	gulp.watch(paths.images.src, copyimages).on('change', reload);
	gulp.watch(paths.videos.src, copyvideos).on('change', reload);
	gulp.watch(paths.animations.src, copyanimations).on('change', reload);
	gulp.watch(paths.templatefiles.src, gulp.series(copyfiles, injectBuildDateTime)).on('change', reload);
	gulp.watch(paths.includefiles.src, gulp.series(copyfiles, injectBuildDateTime)).on('change', reload);
	gulp.watch(paths.staticfiles.src, copystaticfiles).on('change', reload);
	gulp.watch(paths.fonts.src, copyfonts).on('change', reload);
}
exports.watch = watch;


var buildTask = gulp.series(clean, style, javascript, copyscripts, copystaticfiles, copyfiles, copyfonts, copyimages, copyvideos, copyanimations, injectBuildDateTime);
var watchTask = gulp.series(clean, style, javascript, copyscripts, copystaticfiles, copyfiles, copyfonts, copyimages, copyvideos, copyanimations, serve, injectBuildDateTime, watch);

exports.build = buildTask;
exports.watch = watchTask;
