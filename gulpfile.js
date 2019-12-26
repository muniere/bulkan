const gulp = require('gulp');
const del = require('del');
const $ = require('gulp-load-plugins')();

//
// Compile
//
function lint() {
  return gulp.src('src/scripts/**/*.ts')
    .pipe($.eslint())
    .pipe($.eslint.format());
}

function compileScripts() {
  return gulp.src('src/scripts/**/*.ts')
    .pipe($.typescript())
    .pipe(gulp.dest('app/scripts'));
}

function compileImages() {
  return gulp.src('src/images/**/*')
    .pipe(gulp.dest('app/images'));
}

function compileLocales() {
  return gulp.src(['src/_locales/**'], { dot: true })
    .pipe(gulp.dest('app/_locales'));
}

function compileManifest() {
  return gulp.src('src/manifest.json')
    .pipe(gulp.dest('app'));
}

//
// Build
//
function buildScripts(done) {
  return done();
}

function buildImages() {
  return gulp.src('app/images/**')
    .pipe($.if($.if.isFile,
      $.cache($.imagemin({
        progressive: true,
        interlaced: true,
        svgoPlugins: [{ cleanupIDs: false }],
        silent: true
      }))
      .on('error', (err) => {
        this.end();
      })
    ))
    .pipe(gulp.dest('dist/images'));
}

function buildManifest() {
  const cwd = process.cwd();
  return gulp.src('app/manifest.json')
    .pipe($.chromeManifest({
      buildnumber: false,
      background: {
        target: 'scripts/background.js',
        exclude: ['scripts/chromereload.js']
      }
    }))
    .pipe($.if('*.css', $.cleanCss({ compatibility: '*' })))
    .pipe($.if('*.js', $.sourcemaps.init()))
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.js', $.sourcemaps.write('.')))
    .pipe(gulp.dest('dist', { cwd: cwd }));
}

function buildLocales() {
  return gulp.src('app/_locales/**', { dot: true })
    .pipe(gulp.dest('dist/_locales'));
}

function size() {
  return gulp.src('dist/**/*')
    .pipe($.size({ title: 'build', gzip: true }));
}

//
// Archive
//
function archive() {
  const manifest = require('dist/manifest.json');

  return gulp.src('dist/**')
    .pipe($.zip('bulkan-' + manifest.version + '.zip'))
    .pipe(gulp.dest('package'));
}

//
// Watch
//
function watch() {
  $.livereload.listen();

  gulp.watch([
    'app/scripts/**/*.js',
    'app/images/**/*',
    'app/_locales/**/*.json'
  ]).on('change', $.livereload.reload);

  gulp.watch(['src/scripts/**/*.js'], gulp.parallel(lint, compileScripts));
}

//
// Clean
//
function clean() {
  return del(['.tmp', 'app', 'dist']);
}

//
// Export
//
exports.lint = gulp.series(
  lint
);
exports.clean = gulp.series(
  clean
);
exports.compile = gulp.series(
  exports.lint,
  gulp.parallel(
    compileScripts,
    compileImages,
    compileLocales,
    compileManifest
  )
);
exports.build = gulp.series(
  exports.compile,
  gulp.parallel(
    buildScripts,
    buildImages,
    buildManifest,
    buildLocales
  ),
  size
);
exports.watch = gulp.series(
  exports.compile,
  watch
);
exports.archive = gulp.series(
  exports.build,
  archive
);
exports.default = gulp.series(
  exports.clean,
  exports.build
);
