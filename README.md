>Minify PNG using [UPNG.js](https://github.com/photopea/UPNG.js])
## Install
>npm install gulp-upng

## Example
```
var gulp = require('gulp');
var upng = require('gulp-upng');

gulp.task('upng', function () {
	gulp.src('src/**/*.png')
		.pipe(upng({cnum:256}))
		.pipe(gulp.dest('compressed_images'));
});
```
## Options
* cnum: 结果中的颜色数量; 0：所有颜色（无损PNG）
* showLog: 是否显示单个文件压缩日志
