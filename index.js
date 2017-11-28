const through = require('through2');
const gutil = require('gulp-util');
const UPNG = require('upng-js');
const PluginError = gutil.PluginError;

// 常量
const PLUGIN_NAME = 'gulp-upng';

/**
 * @description Buffer 转换为 ArrayBuffer
 * @author cairc
 * @param {any} buf 
 * @returns 
 */
function toArrayBuffer(buf) {
    const ab = new ArrayBuffer(buf.length);
    const view = new Uint8Array(ab);

    for (let i = 0; i < buf.length; ++i) {
        view[i] = buf[i];
    }
    return ab;
}

/**
 * @description ArrayBuffer 转换为 Buffer
 * @author cairc
 * @param {any} buf 
 * @returns 
 */
function toBuffer(ab) {
    const buf = new Buffer(ab.byteLength);
    const view = new Uint8Array(ab);

    for (let i = 0; i < buf.length; ++i) {
        buf[i] = view[i];
    }
    return buf;
}

const OPTIONS = {

    // 结果中的颜色数量; 0：所有颜色（无损PNG）
    'cnum': 256,
    'showLog': false
};

/**
 * @description 插件级别函数 (处理文件)
 * @author cairc
 * @param {any} options 
 * @returns 
 */
function gulpUPng(options) {
    const opts = Object.assign({}, OPTIONS, options);

    // 创建一个让每个文件通过的 stream 通道
    const stream = through.obj(function(file, enc, callback) {
        if (file.isNull() || !/\.png$/.test(file.relative)) {
            this.push(file); // Do nothing if no contents OR not png file
            return callback();
        }
        if (file.isStream()) {
            this.emit('error', new PluginError(PLUGIN_NAME, 'Stream is not supported!'));
            return callback();
        }

        if (file.isBuffer()) {
            const ubuff = new Uint8Array(toArrayBuffer(file.contents));

            const img = UPNG.decode(ubuff);
            const rgba = UPNG.toRGBA8(img)[0];
            const npng = {
                'name': file.relative,
                'width': img.width,
                'height': img.height,
                'odata': ubuff,
                'orgba': new Uint8Array(rgba),
                'ndata': null
            };

            npng.ndata = UPNG.encode([npng.orgba.buffer], npng.width, npng.height, opts.cnum);
            if (npng.ndata.byteLength > npng.odata.byteLength) {
                npng.ndata = npng.odata;
            }

            const os = npng.odata.byteLength;
            const ns = npng.ndata.byteLength;

            if (opts.showLog) {
                gutil.log('gulp-upng: ', gutil.colors.green('✔ ') + file.relative + ' (saved ' + ((os - ns) / os * 100).toFixed(0) + '%)');
            }

            // 确保文件进去下一个插件
            file.contents = toBuffer(npng.ndata);

            this.push(file);
        }

        callback();
    });

    // 返回文件 stream
    return stream;
}

// 暴露（export）插件的主函数
module.exports = gulpUPng;
