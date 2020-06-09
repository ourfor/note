## 使用Kubernetes
安装Minikube:
```bash
curl -Lo minikube https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64 \
  && chmod +x minikube
sudo mkdir -p /usr/local/bin/
sudo install minikube /usr/local/bin/
```
使用包管理工具
```bash
cat <<EOF > /etc/yum.repos.d/kubernetes.repo
[kubernetes]
name=Kubernetes
baseurl=https://packages.cloud.google.com/yum/repos/kubernetes-el7-x86_64
enabled=1
gpgcheck=1
repo_gpgcheck=1
gpgkey=https://packages.cloud.google.com/yum/doc/yum-key.gpg https://packages.cloud.google.com/yum/doc/rpm-package-key.gpg
EOF

# 将 SELinux 设置为 permissive 模式（相当于将其禁用）
setenforce 0
sed -i 's/^SELINUX=enforcing$/SELINUX=permissive/' /etc/selinux/config

yum install -y kubelet kubeadm kubectl --disableexcludes=kubernetes

systemctl enable --now kubelet
```
创建并编辑`/etc/default/kubelet`, 加入`KUBELET_EXTRA_ARGS=--cgroup-driver=systemd --container-runtime=remote --container-runtime-endpoint="unix:///var/run/crio/crio.sock"`

初始化kubernetes, 并设置网段
```bash
kubeadm init --pod-network-cidr=10.244.0.0/16 --ignore-preflight-errors=NumCPU
```

1. 安装podman
```bash
sudo dnf install podman -y
```

2. 指定容器为`cri-o`,驱动为`podman`
设置`cri-o`做容器的参数:
```bash
modprobe overlay
modprobe br_netfilter

# 设置必需的sysctl参数，这些参数在重新启动后仍然存在。
cat > /etc/sysctl.d/99-kubernetes-cri.conf <<EOF
net.bridge.bridge-nf-call-iptables  = 1
net.ipv4.ip_forward                 = 1
net.bridge.bridge-nf-call-ip6tables = 1
EOF

sysctl --system
```

3. 安装cri-o并启动
```bash
dnf install -y https://cbs.centos.org/kojifiles/packages/cri-o/1.15.3/1.el7/x86_64/cri-o-1.15.3-1.el7.x86_64.rpm  # sudo dnf install cri-o
systemctl daemon-reload
systemctl start crio
```
对于Fedora:
```bash
dnf module list cri-o # 查看可用的版本
VERSION=1.18
dnf module enable cri-o:$VERSION
dnf install -y cri-o
```

开始安装
```bash
minikube start \
    --network-plugin=cni \
    --enable-default-cni \
    --container-runtime=cri-o \
    --bootstrapper=kubeadm \
	--driver=podman \
	--extra-config=kubeadm.ignore-preflight-errors=NumCPU --force --cpus 1
```
应为防火墙的原因，需要设置下代理:
```bash
export https_proxy=http://127.0.0.1:10086 http_proxy=http://127.0.0.1:10086 all_proxy=socks5://127.0.0.1:1080
```

或者使用docker.io的镜像, 需要手动修改版本:
```bash
podman pull mirrorgooglecontainers/kicbase:v0.0.8
podman pull mirrorgooglecontainers/pause:3.1
REPOSITORY                    TAG      IMAGE ID       CREATED       SIZE
gcr.io/k8s-minikube/kicbase   v0.0.8   11589cdc9ef4   4 weeks ago   968 MB
podman tag docker.io/mirrorgooglecontainers/pause k8s.gcr.io/pause
```

### 最后
最后还是笔记本先吃上了kubenetes
```bash
😄  Darwin 10.15.4 上的 minikube v1.7.3
✨  Automatically selected the hyperkit driver
💿  正在下载 VM boot image...
    > minikube-v1.7.3.iso.sha256: 65 B / 65 B [--------------] 100.00% ? p/s 0s
    > minikube-v1.7.3.iso: 167.39 MiB / 167.39 MiB  100.00% 770.63 KiB p/s 3m43
🔥  正在创建 hyperkit 虚拟机（CPUs=2，Memory=2000MB, Disk=20000MB）...
🌐  找到的网络选项：
    ▪ http_proxy=http://127.0.0.1:7890
⚠️  您似乎正在使用代理，但您的 NO_PROXY 环境不包含 minikube IP (192.168.64.9)。如需了解详情，请参阅 https://minikube.sigs.k8s.io/docs/reference/networking/proxy/
    ▪ https_proxy=http://127.0.0.1:7890
⚠️  虚拟机无权访问 k8s.gcr.io，或许您需要配置代理或者设置 --image-repository
🐳  正在 Docker 19.03.6 中准备 Kubernetes v1.17.3…
    ▪ env HTTP_PROXY=http://127.0.0.1:7890
    ▪ env HTTPS_PROXY=http://127.0.0.1:7890
💾  正在下载 kubectl v1.17.3
💾  正在下载 kubelet v1.17.3
💾  正在下载 kubeadm v1.17.3
🚀  正在启动 Kubernetes ...
🌟  Enabling addons: default-storageclass, storage-provisioner
⌛  等待集群上线...
🏄  完成！kubectl 已经配置至 "minikube"
```

## 开始安装Serverless服务端
```bash
kubectl create ns kubeless
kubectl create -f https://github.com/kubeless/kubeless/releases/download/v1.0.6/kubeless-v1.0.6.yaml 
```

如果镜像拉不下来，通过`minikube ssh`修改`/etc/systemd/system/kubelet.service.d/10-kubeadm.conf`
```bash
Environment=https_proxy=http://192.168.43.6:7890
Environment=http_proxy=http://192.168.43.6:7890
Environment=all_proxy=socks5://192.168.43.6:7891
```

查看名称空间里面的`pod`:
```bash
kubectl get pods -n kubeless
```
查看部署
```bash
kubectl get deployment -n kubeless
```
查看自定义资源
```bash
kubectl get customresourcedefinition
```

## 安装Serverless
使用yarn安装
```bash
yarn global add serverless
```

创建服务
```bash
serverless create --template kubeless-nodejs --path hello
cd hello
yarn
```