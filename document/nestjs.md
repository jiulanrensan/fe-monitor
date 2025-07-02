# NestJs记录

## 快速搭建

```shell
# 全局安装
pnpm install -g @nestjs/cli

# 新建写微服务
nest new micro-service-write

# 创建读服务
nest new micro-service-read
```

项目目录为

```
server/
├── micro-service-write/
└── micro-service-read/
```

## 编写dockerfile和docker-compose

```
server/
├── micro-service-write/
│   ├── Dockerfile
│   └── ...
├── micro-service-read/
│   ├── Dockerfile
│   └── ...
├── .env             # 环境变量文件
└── docker-compose.yml
```

### 管理命令

```shell
# 在项目根目录执行
docker-compose up --build -d

# 停止所有服务
docker-compose down

# 查看日志
docker-compose logs -f

# 重建服务
docker-compose up --build -d

# 进入 ClickHouse 控制台
docker exec -it clickhouse clickhouse-client --user default --password mysecretpassword
```
