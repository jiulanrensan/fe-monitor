# 前端监控系统 - 服务端

## 项目结构

```
server/
├── micro-service-write/    # 写服务
├── micro-service-read/     # 读服务
├── docker-compose.yml      # Docker编排文件
└── .env                    # 环境变量文件（需要创建）
```

## 快速开始

### 1. 创建环境变量文件

在 `packages/server/` 目录下创建 `.env` 文件：

```bash
# 服务端口配置
WRITE_SERVICE_PORT=3000
READ_SERVICE_PORT=3001

# ClickHouse 配置
CLICKHOUSE_HOST=clickhouse
CLICKHOUSE_PORT=8123
CLICKHOUSE_USER=default
CLICKHOUSE_PASSWORD=
CLICKHOUSE_DB=default
```

### 2. 启动服务

```bash
cd packages/server
docker-compose up -d
```

### 3. 验证服务状态

```bash
# 查看所有容器状态
docker-compose ps

# 查看服务日志
docker-compose logs -f write-service
docker-compose logs -f read-service
docker-compose logs -f clickhouse
```

## 服务说明

### write-service (写服务)

- 端口：3000 (可通过 WRITE_SERVICE_PORT 环境变量修改)
- 功能：处理数据写入请求
- 连接：ClickHouse 数据库

### read-service (读服务)

- 端口：3001 (可通过 READ_SERVICE_PORT 环境变量修改)
- 功能：处理数据查询请求
- 连接：ClickHouse 数据库

## 网络配置

所有服务都在 `app-network` 网络中，服务间可以通过容器名互相访问：

- write-service 和 read-service 可以通过 `clickhouse` 主机名访问数据库

## 数据持久化

重启容器后数据不会丢失。

## 停止服务

```bash
docker-compose down
```

## 清理数据(慎用)

```bash
# 停止服务并删除数据卷
docker-compose down -v
```
