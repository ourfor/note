现在很多视频网站的视频中采用的都是Blob而不是直链的形式，弄懂Blob是如何生成的，才知道如何下载视频
根据StackOverflow上面的[回答](https://stackoverflow.com/questions/30864573/what-is-a-blob-url-and-why-it-is-used), blob url是有浏览器产生的，是没有办法直接访问这个链接的，相信大家或多或少都有遇到这样的情况。这个链接是通过URL的createObjectURL方法生成的，并且可以通过revokeObjectURL方法释放。这些链接只能被当做浏览器在相同的会话中当做本地单例使用


### ajax获取视频数据

```js
export function url2blob(url,create) {
    const xhr = new XMLHttpRequest()
	xhr.onload = () => create(URL.createObjectURL(xhr.response))
	xhr.open('get',url)
	xhr.responseType = "blob"
	xhr.send()
}
```

> MDN上面的[示例](https://developer.mozilla.org/zh-CN/docs/Web/API/MediaSource)
```js
const video = document.querySelector('video');
const assetURL = 'frag_bunny.mp4';
const mimeCodec = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"';

if ('MediaSource' in window && MediaSource.isTypeSupported(mimeCodec)) {
  const mediaSource = new MediaSource();
  video.src = URL.createObjectURL(mediaSource);
  mediaSource.addEventListener('sourceopen', sourceOpen);
} else {
  console.error('Unsupported MIME type or codec: ', mimeCodec);
}

function sourceOpen (_) {
  var mediaSource = this;
  var sourceBuffer = mediaSource.addSourceBuffer(mimeCodec);
  read(assetURL, function (buf) {
    sourceBuffer.addEventListener('updateend', function (_) {
      mediaSource.endOfStream();
      video.play();
    });
    sourceBuffer.appendBuffer(buf);
  });
};

function read (url, cb) {
  var xhr = new XMLHttpRequest;
  xhr.open('get', url);
  xhr.responseType = 'arraybuffer';
  xhr.onload = function () {
    cb(xhr.response);
  };
  xhr.send();
};
```

### ffmpeg视频切片
```bash
file=8K\ CAT_\ 8K猫-Uow2EmxkZAc.mp4
# 获取文件名
dir="${file%%.*}"
# 获取文件拓展名
ext="${file##*.}"
item=items
if test -e $dir; then
    rm -rf $dir
fi
mkdir $dir
ffmpeg -i $file -b:v 1M -g 60 -hls_time 2 -hls_list_size 0 -hls_segment_size 500000 -hls_segment_filename "${dir}/${item}_v%v_%3d.ts" $dir/info.m3u8
```

批量处理
```bash
for file in *.(mp4|mkv); do
    # 获取文件名
    dir="${file%%.*}";
    # 获取文件拓展名
    ext="${file##*.}";
    name=`echo -n "$dir"|md5sum|cut -d ' ' -f1`
    item="items";
    echo "file: $file\next: $ext\ndir: $dir\nmd5: $name"
    if test -e $name; then
	rm -rf $name;
    fi
    mkdir $name;
    ffmpeg -i "$file" -b:v 1M -g 60 -hls_time 2 -hls_list_size 0 -hls_segment_size 500000 -hls_segment_filename "${name}/${item}_v%v_%3d.ts" "$name/info.m3u8"
done
```

有时候生成的视频片段太多了，不容易保存，为了提高播放质量，可以采用字节分段，就是只有一个`ts`切片但是通过字节段进行索引:
```bash
ffmpeg -i sample.mp4 -hls_time 20 -hls_flags single_file out.m3u8
```
生成的`m3u8`文件，内容大概是这样:
```txt
#EXTM3U
#EXT-X-VERSION:4
#EXT-X-TARGETDURATION:22
#EXT-X-MEDIA-SEQUENCE:0
#EXTINF:21.133333,
#EXT-X-BYTERANGE:3253340@4627244
out.ts
#EXTINF:18.000000,
#EXT-X-BYTERANGE:4278692@7880584
out.ts
#EXTINF:22.366667,
#EXT-X-BYTERANGE:2710584@12159276
out.ts
#EXTINF:17.100000,
#EXT-X-BYTERANGE:2478404@14869860
out.ts
#EXTINF:7.800000,
#EXT-X-BYTERANGE:1303216@17348264
out.ts
#EXT-X-ENDLIST
```

通常还会对视频进行加密，视频文件可以通过CDN分发
1. 创建一个16字节大小的文件，比如像`enc-key`写入`abcd12347890efgh`
2. 创建一个`enc-info`的文件，写入如下内容:
```txt
https://demo.ourfor.top/movies/enc-key
enc-key
```
或者通过命令:
```bash
BASE_URL="path"
openssl rand 16 > file.key
echo $BASE_URL/file.key > file.keyinfo
echo file.key >> file.keyinfo
echo $(openssl rand -hex 16) >> file.keyinfo
```
3. 开始加密:
```bash
ffmpeg -y -i sample.mp4 -hls_time 12 -hls_key_info_file enc-info -hls_playlist_type vod -hls_segment_filename "file-%5d.ts" out.m3u8 # 多文件切片加密
```
ffmpeg生成单文件加密有bug，使用mp42hsl, 相关命令:
```bash
openssl rand 16 > enc.key
mp42hls --encryption-key $(xxd -ps enc.key) \
    --encryption-key-uri https://demo.ourfor.top/Movies/test/enc.key sample.mp4 # 多文件
mp42hls --encryption-key $(xxd -ps enc.key) \
  --encryption-key-uri enc.key --encryption-iv-mode sequence \
  --iframe-index-filename output-iframs.m3u8 \
  --segment-filename-template output.ts \
  --segment-url-template output.ts \
  --index-filename output.m3u8 \
  --output-single-file sample.mp4
```

## 视频缩略图

ffmpeg为每秒钟生成图片
```bash
ffmpeg -i video.mp4 -vf fps=1 thumb_%6d.png
```

利用ImageMagisk命令进行拼接
```bash
montage *.png -tile 8x8 -geometry 160x90+0+0 preview.png
```