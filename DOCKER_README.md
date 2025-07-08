# Docker 部署指南

本项目提供了完整的 Docker 部署方案，包括开发环境和生产环境。

## 环境配置

### 环境变量

创建 `.env` 文件来配置环境变量：

```bash
# 服务端口配置
WRITE_SERVICE_PORT=3001
READ_SERVICE_PORT=3000

# ClickHouse 配置（需要外部提供）
CLICKHOUSE_HOST=localhost
CLICKHOUSE_PORT=8123
CLICKHOUSE_USER=default
CLICKHOUSE_PASSWORD=
CLICKHOUSE_DB=default
```

## 开发环境

### 启动开发环境

```bash
# 启动所有服务（开发模式）
docker-compose -f docker-compose.dev.yml up -d

# 查看日志
docker-compose -f docker-compose.dev.yml logs -f

# 停止服务
docker-compose -f docker-compose.dev.yml down
```

### 开发环境特性

- 代码热重载
- 源码映射到容器
- 实时日志输出
- 快速重启

## 生产环境

### 启动生产环境

```bash
# 构建并启动所有服务
docker-compose up -d --build

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f [service-name]

# 停止服务
docker-compose down
```

### 生产环境特性

- 多阶段构建优化镜像大小
- 非 root 用户运行
- 健康检查
- 自动重启策略
- 资源限制
- 优雅关闭

## 服务说明

### 微服务架构

1. **write-service** (端口: 3001)
   - 负责数据写入
   - 处理监控数据上报
   - 健康检查端点: `/health`

2. **read-service** (端口: 3000)
   - 负责数据查询
   - 提供 API 查询接口
   - 健康检查端点: `/health`

### 网络配置

- 所有服务通过 `app-network` 网络通信
- 服务间使用容器名进行通信
- 外部通过端口映射访问

### ClickHouse 数据库

**注意**: 本项目不包含 ClickHouse 数据库服务，您需要：

- 使用外部 ClickHouse 实例
- 或者单独部署 ClickHouse 容器
- 确保通过环境变量正确配置连接信息

## 健康检查

### 服务健康检查

```bash
# 检查 write-service 健康状态
curl http://localhost:3001/health

# 检查 read-service 健康状态
curl http://localhost:3000/health
```

### Docker 健康检查

```bash
# 查看容器健康状态
docker ps

# 查看健康检查日志
docker inspect --format='{{json .State.Health}}' [container-name]
```

## 监控和日志

### 查看日志

```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f write-service
docker-compose logs -f read-service
```

### 资源监控

```bash
# 查看容器资源使用情况
docker stats

# 查看特定容器资源使用
docker stats write-service read-service
```

## 故障排除

### 常见问题

1. **端口冲突**

   ```bash
   # 检查端口占用
   netstat -tulpn | grep :3000
   netstat -tulpn | grep :3001
   ```

2. **容器启动失败**

   ```bash
   # 查看容器日志
   docker-compose logs [service-name]

   # 重新构建镜像
   docker-compose build --no-cache
   ```

3. **ClickHouse 连接失败**

   ```bash
   # 检查 ClickHouse 是否可访问
   curl http://localhost:8123/ping

   # 检查环境变量配置
   docker-compose exec write-service env | grep CLICKHOUSE
   ```

### 清理资源

```bash
# 停止并删除所有容器
docker-compose down

# 删除所有镜像
docker-compose down --rmi all

# 完全清理（谨慎使用）
docker system prune -a --volumes
```

## 性能优化

### 资源限制

生产环境已配置资源限制：

- 微服务: 512MB 内存, 0.5 CPU

### 镜像优化

- 使用多阶段构建
- 只安装生产依赖
- 使用 Alpine Linux 基础镜像
- 配置 .dockerignore 排除不必要文件

## 安全建议

1. 修改默认的 ClickHouse 密码
2. 使用非 root 用户运行容器
3. 限制容器网络访问
4. 定期更新基础镜像
5. 启用容器安全扫描

## 扩展部署

### 使用 Docker Swarm

```bash
# 初始化 Swarm
docker swarm init

# 部署服务
docker stack deploy -c docker-compose.yml fe-monitor

# 查看服务状态
docker service ls
```

### 使用 Kubernetes

可以使用 `kompose` 工具将 docker-compose 转换为 Kubernetes 配置：

```bash
# 安装 kompose
curl -L https://github.com/kubernetes/kompose/releases/download/v1.26.0/kompose-linux-amd64 -o kompose
chmod +x kompose

# 转换配置
./kompose convert -f docker-compose.yml
```
