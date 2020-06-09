## API 网关

### 配置Kong

#### 创建服务

```bash
curl -i -X POST \
--url http://localhost:8001/services \
--data "name=example" \
--data "url=http://api.other.com"
```

#### 添加路由

```bash
curl -i -X POST \
--url http://localhost:8001/services/example/routes \
--data "hosts[]=test.example.com"
```
