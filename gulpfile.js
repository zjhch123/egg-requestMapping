const gulp = require('gulp');
const babel = require('gulp-babel');

gulp.task('default', () => {
  gulp.src('dev/**/*.js')
      .pipe(babel())
      .pipe(gulp.dest('app'))
})

gulp.watch('dev/**/*.js', ['default'])