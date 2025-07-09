# Docker 配置说明

本项目使用 Docker 进行容器化部署，支持生产环境和开发环境。

## 项目结构

```
fe-monitor/
├── docker-compose.yml          # 生产环境配置
├── docker-compose.dev.yml      # 开发环境配置
├── .dockerignore              # Docker 忽略文件
├── package.json               # 根目录依赖配置
├── pnpm-lock.yaml            # pnpm 锁文件
└── packages/
    ├── server/
    │   ├── micro-service-write/
    │   │   └── Dockerfile     # 写服务 Dockerfile
    │   └── micro-service-read/
    │       └── Dockerfile     # 读服务 Dockerfile
    └── shared/                # 共享模块
```

## 设计特点

1. **Monorepo 架构**: 使用根目录作为工作空间，所有服务共享根目录的依赖
2. **pnpm 包管理**: 使用 pnpm 和根目录的 `pnpm-lock.yaml` 确保依赖版本一致
3. **多阶段构建**: 构建阶段和生产阶段分离，优化镜像大小
4. **独立服务**: 每个服务使用独立的 Dockerfile
5. **统一管理**: 使用 docker-compose 统一管理所有服务

## 环境变量

支持以下环境变量配置：

- `WRITE_SERVICE_PORT`: 写服务端口 (默认: 3001)
- `READ_SERVICE_PORT`: 读服务端口 (默认: 3000)
- `CLICKHOUSE_HOST`: ClickHouse 主机地址 (默认: localhost)
- `CLICKHOUSE_PORT`: ClickHouse 端口 (默认: 8123)
- `CLICKHOUSE_USER`: ClickHouse 用户名 (默认: default)
- `CLICKHOUSE_PASSWORD`: ClickHouse 密码 (默认: 空)
- `CLICKHOUSE_DB`: ClickHouse 数据库名 (默认: default)

## 生产环境

### 构建和启动

```bash
# 构建镜像
pnpm run docker:build

# 启动服务
pnpm run docker:up

# 查看日志
pnpm run docker:logs

# 停止服务
pnpm run docker:down

# 重启服务
pnpm run docker:restart
```

### 服务端口

- 写服务: 3001
- 读服务: 3000

## 开发环境

### 构建和启动

```bash
# 构建开发镜像
pnpm run docker:dev:build

# 启动开发服务
pnpm run docker:dev:up

# 查看开发日志
pnpm run docker:dev:logs

# 停止开发服务
pnpm run docker:dev:down
```

### 开发特性

- 代码热重载: 源代码目录挂载到容器中
- 依赖缓存: node_modules 使用 Docker 卷缓存
- 实时日志: 支持实时查看服务日志

## Dockerfile 说明

### 构建阶段 (builder)

1. 使用 Node.js 18 Alpine 镜像
2. 安装 pnpm 包管理器
3. 复制根目录依赖文件 (`package.json`, `pnpm-lock.yaml`)
4. 复制 TypeScript 配置文件
5. 使用 pnpm 安装依赖
6. 复制源代码
7. 构建项目

### 生产阶段 (production)

1. 使用 Node.js 18 Alpine 镜像
2. 安装 dumb-init 用于信号处理
3. 创建非 root 用户
4. 复制构建产物
5. 安装生产依赖
6. 配置启动命令

## 注意事项

1. 确保根目录的 `pnpm-lock.yaml` 文件存在且是最新的
2. 开发环境使用卷挂载，修改代码会自动重载
3. 生产环境使用多阶段构建，镜像更小更安全
4. 所有服务都配置了健康检查
5. 使用 dumb-init 确保容器信号处理正确

## 故障排除

### 构建失败

1. 检查 `pnpm-lock.yaml` 文件是否存在
2. 确认所有依赖文件都已复制到 Docker 上下文
3. 检查网络连接，确保能正常下载依赖

### 服务启动失败

1. 检查端口是否被占用
2. 确认环境变量配置正确
3. 查看容器日志: `docker-compose logs <service-name>`

### 开发环境热重载不工作

1. 确认卷挂载配置正确
2. 检查文件权限
3. 重启开发容器
