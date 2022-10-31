import gulp from 'gulp';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import fileinclude from 'gulp-file-include';
import { deleteAsync } from 'del';
import cssnano from 'cssnano';
import sourcemaps from 'gulp-sourcemaps';
// import minify from 'gulp-babel-minify';
import rename from 'gulp-rename';
// import inject from 'gulp-inject-string';
import babel from 'gulp-babel';
import concat from 'gulp-concat';
import browserSync from 'browser-sync';

const { series, parallel, src, dest, task } = gulp;
const sass = gulpSass(dartSass);



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
		dest: 'dist/',
	},
	includefiles: {
		src: ['src/includes/**/*.html'],
	},
	staticfiles: {
		src: ['src/**/*.pdf', 'src/.htaccess'],
		dest: 'dist/',
	},
	fonts: {
		src: 'src/fonts/**/*.*',
		dest: 'dist/fonts/',
	},
	images: {
		src: 'src/images/**/*.*',
		dest: 'dist/images/',
	},
	videos: {
		src: 'src/videos/**/*.*',
		dest: 'dist/videos/',
	}
};


// TASK: Clean Assets
function clean() {
	return deleteAsync(['dist']);
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
			// .pipe(minify({
			// 	mangle: {
			// 	  keepClassName: true
			// 	}
			// }))
			.pipe(rename(function (path) {
				path.basename += '.min';
			}))
			.pipe(gulp.dest(paths.scripts.dest))
			.pipe(sourcemaps.write('.'))
			.pipe(gulp.dest(paths.scripts.dest))
			.pipe(browserSync.stream())
	);
}



// TASK: Copy External JavaScript to /dist/ext
function copyscripts() {
	return (
		gulp
			.src(paths.externalscripts.src, { sourcemaps: true })
			.pipe(gulp.dest(paths.externalscripts.dest, { sourcemaps: true }))
			.pipe(browserSync.stream())
	);
}



// TASK: Add / Update Build DateTime
// function injectBuildDateTime() {
// 	const date = new Date();
// 	const dateoptions = { weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };
// 	let datetime = date.toLocaleDateString('de-DE', dateoptions);

// 	return gulp
// 		.src('src/pages/index.html')
// 		.pipe(
// 			fileinclude({
// 				prefix: '@@',
// 				basepath: 'src/includes/'
// 			})
// 		)
// 		.pipe(inject.replace('BUILDDATE', datetime))
// 		.pipe(gulp.dest(paths.templatefiles.dest));
// }



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



// TASK: Copy Static Files to /dist
function copystaticfiles() {
	return gulp
		.src(paths.staticfiles.src)
		.pipe(gulp.dest(paths.staticfiles.dest)
	);
}



// TASK: Copy Fonts to /dist
function copyfonts() {
	return (
		gulp
			.src(paths.fonts.src)
			.pipe(gulp.dest(paths.fonts.dest))
	);
}



// TASK: Copy Images to /dist
function copyimages() {
	return (
		gulp
			.src(paths.images.src)
			.pipe(gulp.dest(paths.images.dest))
	);
}



// TASK: Copy Videos to /dist
function copyvideos() {
	return (
		gulp
			.src(paths.videos.src)
			.pipe(gulp.dest(paths.videos.dest))
	);
}



// TASK: Watch
function watch() {
	gulp.watch(paths.styles.src, gulp.series(style));
	gulp.watch(paths.scripts.src, gulp.series(javascript)).on('change', reload);
	gulp.watch(paths.externalscripts.src, copyscripts).on('change', reload);
	gulp.watch(paths.images.src, copyimages).on('change', reload);
	gulp.watch(paths.videos.src, copyvideos).on('change', reload);
	gulp.watch(paths.templatefiles.src, gulp.series(copyfiles)).on('change', reload);
	gulp.watch(paths.includefiles.src, gulp.series(copyfiles)).on('change', reload);
	gulp.watch(paths.staticfiles.src, copystaticfiles).on('change', reload);
	gulp.watch(paths.fonts.src, copyfonts).on('change', reload);
}


export const build = series(clean, style, javascript, copyscripts, copystaticfiles, copyfiles, copyfonts, copyimages, copyvideos);

export default series(clean, style, javascript, copyscripts, copystaticfiles, copyfiles, copyfonts, copyimages, copyvideos, serve, watch);
