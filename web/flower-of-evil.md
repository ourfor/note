字幕: https://s3-ap-northeast-1.amazonaws.com/tv-aws-media-convert-input-tokyo/subtitles/11391/11391-eps-1.vtt
视频: 
    1: https://d3c7rimkq79yfu.cloudfront.net/11391/1/v2/1080/11391-eps-1_1080p.ts
    2: https://d3c7rimkq79yfu.cloudfront.net/11391/2/v2/1080/11391-eps-2_1080p.ts
M3U8: 
    1: https://d3c7rimkq79yfu.cloudfront.net/11391/1/v2/1080/11391-eps-1_1080p.m3u8
    2: https://d3c7rimkq79yfu.cloudfront.net/11391/2/v2/1080/11391-eps-2_1080p.m3u8


下载: wget $link -O $filename
批处理: 
```bash
for i in {1..8}; 
    do 
        wget "https://d3c7rimkq79yfu.cloudfront.net/11391/$i/v2/1080/11391-eps-${i}_1080p.m3u8" -O "flower-of-evil-eps-$i.m3u8";
        wget "https://s3-ap-northeast-1.amazonaws.com/tv-aws-media-convert-input-tokyo/subtitles/11391/11391-eps-${i}.vtt" -O "flower-of-evil-eps-$i.vtt" 
        wget "https://d3c7rimkq79yfu.cloudfront.net/11391/$i/v2/1080/11391-eps-${i}_1080p.ts" -O "flower-of-evil-eps-$i.ts"
done
```

首先获取剧集的key:
```bash
url: https://www.linetv.tw/api/part/11391/eps/1/part?chocomemberId=
method: get
```
```bash
curl -i -X GET https://www.linetv.tw/api/part/11391/eps/1/part?chocomemberId=
```

然后获取对应剧集的Token
```http
url: https://www.linetv.tw/api/part/dinosaurKeeper
method: post
content-type: application/json
body: {"keyType":"B","keyId":"34b94c8a-1cf5-423c-926a-d2b370fbc776","dramaId":11391,"eps":3}
```
curl 示例
```bash
curl -i -X POST --url https://www.linetv.tw/api/part/dinosaurKeeper \
    -H "content-type: application/json" \
    -d '{"keyType":"B","keyId":"f48e1389-c0f5-454a-9319-d8083580b2df","dramaId":11391,"eps":4}'
```

下载密钥:
```bash
curl https://keydeliver.linetv.tw/jurassicPark --header "authorization: $auth" -o evil-key
```

替换文本:
```bash
sed -i ".bak" "s?https://keydeliver.linetv.tw/jurassicPark?evil-key-05?g" flower-of-evil-eps-5.m3u8
sed -i ".bak" "s?11391-eps-5_1080p.ts?flower-of-evil-eps-5.ts?g" flower-of-evil-eps-5.m3u8
```