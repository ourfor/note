### 安装openocd
```bash
brew install openocd
```

### 连接`CMSIS-DAP`下载程序
添加配置文件`ocd-stm32.cfg`,添加如下内容:
```bash
interface cmsis-dap
transport select swd
source [find target/stm32f4x.cfg]
```

启动OpenOCD: `openocd -f ./ocd-stm32.cfg`

通过`telnet`下载程序, 首先连接`openocd`, `telnet 127.0.0.1 4444`
```bash
halt # 关闭
flash write_image erase ./stm32f4.hex #下载程序 ./stm32f4.hex为hex路径，相对于openocd启动路径
reset # 重置
```