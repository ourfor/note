## 打开ADB局域网调试
```bash
setprop service.adb.tcp.port 5555
stop adbd
start adbd
```