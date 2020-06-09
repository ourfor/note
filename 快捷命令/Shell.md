- Linux下面获取uuid
```bash
cat /proc/sys/kernel/random/uuid
```

- 五位以内随机数(RANDOM变量)
```bash
echo $RAMDOM
```

- 使用`/dev/random`或者`/dev/urandom`随机文件, 并使用`cksum`计算
```bash
head -20 /dev/random | cksum
head -20 /dev/urandom | cksum
```

- macOS下面字符转16进制
```bash
echo -n "string" | xxd
```

- macOS下面转Base64编码
```bash
echo -n "string" | base64
```