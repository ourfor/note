前不久免费领了一台阿里云的服务器.
<!--more-->
## 添加SSL支持
```bash
sudo dnf install mod_ssl openssl -y
```

### 阿里云提供的证书服务

一般来说我会把证书放在`/etc/ssl/certs`这个目录下面
```bash
.
├── ca-bundle.crt -> /etc/pki/ca-trust/extracted/pem/tls-ca-bundle.pem
├── ca-bundle.trust.crt -> /etc/pki/ca-trust/extracted/openssl/ca-bundle.trust.crt
├── localhost.crt
└── vlog.ourfor.top
    ├── vlog.ourfor.top_chain.crt
    ├── vlog.ourfor.top.key
    └── vlog.ourfor.top_public.crt
```
然后在``

### 证书模板
```apache
<VirtualHost *:443>     
    ServerName   #修改为申请证书时绑定的域名www.YourDomainName1.com。                    
    DocumentRoot  /data/www/hbappserver/public          
    SSLEngine on   
    SSLProtocol all -SSLv2 -SSLv3 # 添加SSL协议支持协议，去掉不安全的协议。
    SSLCipherSuite HIGH:!RC4:!MD5:!aNULL:!eNULL:!NULL:!DH:!EDH:!EXP:+MEDIUM   # 修改加密套件。
    SSLHonorCipherOrder on
    SSLCertificateFile cert/domain name1_public.crt   # 将domain name1_public.crt替换成您证书文件名。
    SSLCertificateKeyFile cert/domain name1.key   # 将domain name1.key替换成您证书的密钥文件名。
    SSLCertificateChainFile cert/domain name1_chain.crt  # 将domain name1_chain.crt替换成您证书的密钥文件名；证书链开头如果有#字符，请删除。
</VirtualHost>
```

优化配置模板, 文件名`00-http.conf`, 以`00`命名可以保证在其它文件加载前先加载
```apache
<Macro VHostHttp $host $port $dir>
<VirtualHost *:$port>
    DocumentRoot  $dir
    ServerName  $host
    <Directory "/">
        Options Indexes FollowSymLinks
        AllowOverride   None
        Order   allow,deny
        Require all granted
        Allow from all
    </Directory>
    ErrorLog "/var/log/httpd/$host-error_log"
    RewriteEngine on
    RewriteCond %{SERVER_NAME} =$host
    RewriteRule ^ https://%{SERVER_NAME}%{REQUEST_URI} [END,NE,R=permanent]
</VirtualHost>
</Macro>
```

`00-https.conf`
```apache
<Macro VHost $host $port $dir>
	<IfModule mod_ssl.c>
	<VirtualHost *:$port>
	    DocumentRoot $dir
	    ServerName  $host
	    <Directory "/">
	        Options -Indexes +FollowSymLinks
	        AllowOverride   None
	        Order   allow,deny
	        Require all granted
	        Allow from all
	    </Directory>
	    ErrorLog /var/log/httpd/$host_error_log

	    SSLCertificateFile /etc/ssl/certs/$host/public.crt
	    SSLCertificateKeyFile /etc/ssl/certs/$host/one.key
	    SSLCertificateChainFile /etc/ssl/certs/$host/chain.crt
		Include /etc/ssl/certs/options-ssl.conf
	</VirtualHost>
	</IfModule>
</Macro>
```

使用`blog-ssl.conf`
```apache
Use VHost vlog.ourfor.top 443 /var/www/blog
```

`options-ssl.conf`内容:
```apache
SSLEngine on   
SSLProtocol all -SSLv2 -SSLv3
SSLCipherSuite HIGH:!RC4:!MD5:!aNULL:!eNULL:!NULL:!DH:!EDH:!EXP:+MEDIUM
SSLHonorCipherOrder on
```

最后检查下语法
```bash
httpd -t
```
重新加载配置文件`apachectl graceful`


### 通过Certbot申请免费证书

安装***Certbot***
```bash
wget https://dl.eff.org/certbot-auto
sudo mv certbot-auto /usr/local/bin/certbot-auto
sudo chown root /usr/local/bin/certbot-auto
sudo chmod 0755 /usr/local/bin/certbot-auto
```

执行`sudo /usr/local/bin/certbot-auto --apache`申请证书的时候, 遇到了错误❌
```bash
Saving debug log to /var/log/letsencrypt/letsencrypt.log
Error while running apachectl configtest.

AH00526: Syntax error on line 85 of /etc/httpd/conf.d/ssl.conf:
SSLCertificateFile: file '/etc/pki/tls/certs/localhost.crt' does not exist or is empty

The apache plugin is not working; there may be problems with your existing configuration.
The error was: MisconfigurationError("Error while running apachectl configtest.\n\nAH00526: Syntax error on line 85 of /etc/httpd/conf.d/ssl.conf:\nSSLCertificateFile: file '/etc/pki/tls/certs/localhost.crt' does not exist or is empty\n",)
```
意思是找不到`ssl.conf`里面引用的文件，需要通过下面的命令生成这些文件:
```bash
/usr/libexec/httpd-ssl-gencerts
```

最后会生成apache配置文件
```apache
<IfModule mod_ssl.c>
<VirtualHost *:443>
    DocumentRoot    /var/www/blog
    ServerName  vlog.ourfor.top
    <Directory "/">
        Options Indexes FollowSymLinks
        AllowOverride   None
        Order   allow,deny
        Require all granted
        Allow from all
    </Directory>
    ErrorLog "/var/log/httpd/blog.ourfor.com-error_log"

SSLCertificateFile /etc/letsencrypt/live/vlog.ourfor.top/fullchain.pem
SSLCertificateKeyFile /etc/letsencrypt/live/vlog.ourfor.top/privkey.pem
Include /etc/letsencrypt/options-ssl-apache.conf
</VirtualHost>
</IfModule>
```

## 还是WordPress
一个成熟流行的CMS需要做哪些设计，该怎么权衡功能和体验

## WordPress 相关问题

### 提示429请求次数过多
这个是由于国内的网络请求达到了限制，比较好的解决办法是通过插件`Kill 429`来科学上网

### 插件更新和安装提示文件拷贝失败
需要将网站根目录以及下面的所有文件的所有者修改为web服务器的用户
比如我使用的是`Apache`的httpd服务器程序，并且我在`httpd`里面看到用户名为`apache`,组名为`apache`,
那么我需要修改我的网站根目录`/var/www/blog`的用户和组
```bash
chown -R apache:apache /var/www/blog
```


### 安装***Certbot***

```bash
wget https://dl.eff.org/certbot-auto
sudo mv certbot-auto /usr/local/bin/certbot-auto
sudo chown root /usr/local/bin/certbot-auto
sudo chmod 0755 /usr/local/bin/certbot-auto
```

执行`sudo /usr/local/bin/certbot-auto --apache`申请证书的时候, 遇到了错误❌
```bash
Saving debug log to /var/log/letsencrypt/letsencrypt.log
Error while running apachectl configtest.

AH00526: Syntax error on line 85 of /etc/httpd/conf.d/ssl.conf:
SSLCertificateFile: file '/etc/pki/tls/certs/localhost.crt' does not exist or is empty

The apache plugin is not working; there may be problems with your existing configuration.
The error was: MisconfigurationError("Error while running apachectl configtest.\n\nAH00526: Syntax error on line 85 of /etc/httpd/conf.d/ssl.conf:\nSSLCertificateFile: file '/etc/pki/tls/certs/localhost.crt' does not exist or is empty\n",)
```
意思是找不到`ssl.conf`里面引用的文件，需要通过下面的命令生成这些文件:
```bash
/usr/libexec/httpd-ssl-gencerts
```