const gulp = require('gulp');
const del = require('del');
const $ = require('gulp-load-plugins')();

gulp.task('extras', () => {
  return gulp.src([
    'app/*.*',
    'app/_locales/**',
    '!app/scripts.babel',
    '!app/*.json'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'));
});

gulp.task('lint', () => {
  return gulp.src('app/scripts.babel/**/*.js')
    .pipe($.eslint())
    .pipe($.eslint.format());
});

gulp.task('images', () => {
  return gulp.src('app/images/**/*')
    .pipe($.if($.if.isFile, $.cache($.imagemin({
      progressive: true,
      interlaced: true,
      // don't remove IDs from SVGs, they are often used
      // as hooks for embedding and styling
      svgoPlugins: [{ cleanupIDs: false }]
    }))
      .on('error', function (err) {
        console.log(err);
        this.end();
      })))
    .pipe(gulp.dest('dist/images'));
});

gulp.task('manifest', () => {
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
});

gulp.task('babel', () => {
  return gulp.src('app/scripts.babel/**/*.js')
    .pipe($.babel())
    .pipe(gulp.dest('app/scripts'));
});

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('watch', gulp.series(gulp.parallel('lint', 'babel'), () => {
  $.livereload.listen();

  gulp.watch([
    'app/scripts/**/*.js',
    'app/images/**/*',
    'app/styles/**/*',
    'app/_locales/**/*.json'
  ]).on('change', $.livereload.reload);

  gulp.watch('app/scripts.babel/**/*.js', ['lint', 'babel']);
}));

gulp.task('size', () => {
  return gulp.src('dist/**/*').pipe($.size({ title: 'build', gzip: true }));
});

gulp.task('package', () => {
  var manifest = require('./dist/manifest.json');
  return gulp.src('dist/**')
    .pipe($.zip('bulkan-' + manifest.version + '.zip'))
    .pipe(gulp.dest('package'));
});

gulp.task('build', gulp.series(
  'lint',
  'babel',
  'manifest',
  gulp.parallel('images', 'extras'),
  'size'
));

gulp.task('default', gulp.series('clean', 'build'));
