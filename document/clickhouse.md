# 在docker中使用clickhouse

[使用 Docker 安装 ClickHouse](https://clickhouse.com/docs/zh/install/docker)

```shell
# 拉取
docker pull clickhouse/clickhouse-server
```

## 连接 Docker 中运行的 ClickHouse

```shell
# 启动服务器实例
# docker run -d \
#   --name some-clickhouse-server \
#   --ulimit nofile=262144:262144 \
#   -p 8123:8123 \     # 映射 HTTP 端口
#   -p 9000:9000 \     # 映射 TCP 端口
#   clickhouse/clickhouse-server
docker run -d --name some-clickhouse-server --ulimit nofile=262144:262144 -p 8123:8123 -p 9000:9000 clickhouse/clickhouse-server

# 验证端口映射
docker ps
# 输出

CONTAINER ID   IMAGE                          COMMAND            CREATED          STATUS          PORTS                                                      NAMES
544fdf7b15a3   clickhouse/clickhouse-server   "/entrypoint.sh"   13 seconds ago   Up 11 seconds   0.0.0.0:8123->8123/tcp, 0.0.0.0:9000->9000/tcp, 9009/tcp   some-clickhouse-server

# 从本地客户端连接
docker exec -it some-clickhouse-server clickhouse-client

# 在 Postman 中访问
# 创建账户见下方
http://localhost:8123/?query=SELECT%20version()&user=fre_monitor_user&password=Password123!
# 或
http://127.0.0.1:8123/?query=SELECT%20version()&user=fre_monitor_user&password=Password123!

# 输出版本号即为配置成功

# 使用接口查询
# 以json格式返回10条数据
curl --location 'http://127.0.0.1:8123/?database=fre_monitor_db' \
  --user 'fre_monitor_user:Password123!' \
  --data-binary 'SELECT * FROM test LIMIT 10 FORMAT JSON'
```

默认情况下，ClickHouse 只能通过 Docker 网络访问
默认情况下，启动的上述服务器实例将作为 `default` 用户运行，无需密码
此时进入client服务，可以执行sql语句

## 用户操作

你可以使用 CREATE USER 语句在 ClickHouse 中新建用户并设置密码。推荐使用 sha256_password 或 double_sha1_password 方式存储密码，具体取决于你的接入方式（如 MySQL 接口需用 double_sha1）

1. 使用 SHA256 密码（推荐方式）

```shell
CREATE USER IF NOT EXISTS fre_monitor_user
IDENTIFIED WITH sha256_password BY 'Password123!';
```

此方式 ClickHouse 会自动为你加密密码。密码需满足复杂度要求（如长度≥12，包含数字、大写、小写和特殊字符）

2. 使用 double SHA1 密码（MySQL 接口需要）
   先用 shell 工具生成 double SHA1 hash，然后

```shell
CREATE USER IF NOT EXISTS fre-monitor-user
IDENTIFIED WITH double_sha1_hash BY 'your_double_sha1_hash';
```

这种方式适用于通过 MySQL 协议访问 ClickHouse 的场景

3. 为新用户分配权限

```shell
GRANT SELECT ON my_database.* TO fre_monitor_user
```

4. 查看所有用户

```shell
SHOW USERS;
```

## 数据库操作

### 创建数据库

```shell
CREATE DATABASE IF NOT EXISTS fre_monitor_db;
```

`fre_monitor_db` 是你要创建的数据库名称

`IF NOT EXISTS` 可选，表示如果数据库已存在则不会报错

### 返回当前数据库的名称

```shell
SELECT currentDatabase();
```

执行结果

```
SELECT currentDatabase()

Query id: f1d2f0d1-3032-4862-8634-dfe957d53f7e

   ┌─currentDatabase───┐
1. │ default           │
   └───────────────────┘

1 row in set. Elapsed: 0.002 sec.
```

### 查看所有数据库

```
SHOW DATABASES;
```

### 选择某个数据库

```
USE my_database;
```

## crud

### 创建表

```shell
# CREATE TABLE your_database.your_table_name
CREATE TABLE default.slow_request
(
    appname String,
    type String,
    url String,
    method String,
    duration Float64,
    sid String,
    timestamp DateTime,
    userid String,

    INDEX duration_idx duration TYPE minmax GRANULARITY 4,
    INDEX url_idx url TYPE tokenbf_v1(32768, 3, 0) GRANULARITY 2
)
ENGINE = MergeTree()
PARTITION BY toYYYYMMDD(timestamp)
ORDER BY (appname, type, timestamp)
TTL timestamp + INTERVAL 7 DAY
SETTINGS index_granularity = 8192;
```

#### 字段解释

```shell
# 数据过期策略
# 自动删除超过7天的数据
# ClickHouse后台自动执行清理，无需人工干预
TTL timestamp + INTERVAL 7 DAY

# 分区策略
# 按天分区（根据时间戳字段）
# 提升时间范围查询效率
# 加速过期数据删除速度
PARTITION BY toYYYYMMDD(timestamp)

# 主键索引
# 优化按应用名(appname)和错误类型(type)的查询
# 时间戳作为第三排序键加速时间范围查询
ORDER BY (appname, type, timestamp)

# 参数调优
# 适用于中等规模数据集（单日百万级记录）
# 平衡查询性能和内存消耗
SETTINGS index_granularity = 8192

# 二级索引增强
# 针对性能指标duration的minmax索引
# 加速慢查询分析（如 WHERE duration > 3.0）
INDEX duration_idx duration TYPE minmax GRANULARITY 4

# 布隆过滤器索引优化URL模糊查询
# 支持 WHERE url LIKE '%/api/%' 类查询
INDEX url_idx url TYPE tokenbf_v1(32768, 3, 0) GRANULARITY 2
```

### 存在某个表

```shell
EXISTS TABLE slow_request;
```

### 插入数据

```shell
# 你可以一次插入多行数据，每行用逗号分隔
# 如果你有大量数据，建议批量插入以获得更好的性能。ClickHouse 推荐每次插入成千上万甚至更多行，以减少存储碎片和提升写入效率
INSERT INTO slow_request (appname, type, url, method, duration, sid, timestamp, userid) VALUES
    ('app1', 'api', '/url1', 'GET', 10.1, 'sid1', now(), 'user1'),
    ('app2', 'web', '/url2', 'POST', 20.2, 'sid2', now(), 'user2'),
    ('app3', 'api', '/url3', 'GET', 30.3, 'sid3', now(), 'user3'),
    ('app4', 'web', '/url4', 'POST', 40.4, 'sid4', now(), 'user4'),
    ('app5', 'api', '/url5', 'GET', 50.5, 'sid5', now(), 'user5'),
    ('app6', 'web', '/url6', 'POST', 60.6, 'sid6', now(), 'user6'),
    ('app7', 'api', '/url7', 'GET', 70.7, 'sid7', now(), 'user7'),
    ('app8', 'web', '/url8', 'POST', 80.8, 'sid8', now(), 'user8'),
    ('app9', 'api', '/url9', 'GET', 90.9, 'sid9', now(), 'user9'),
    ('app10', 'web', '/url10', 'POST', 100.0, 'sid10', now(), 'user10');
```

### 查询数据

```shell
SELECT appname, type, url, method, duration, sid
FROM slow_request
WHERE timestamp >= '2024-06-01 00:00:00'
  AND timestamp < '2024-06-10 00:00:00'
ORDER BY timestamp DESC # 排序条件
LIMIT 10 OFFSET 10; # LIMIT 10 表示每页返回 10 条数据；OFFSET 10 表示跳过前 10 条（即第 2 页）
```

### 新增字段

```shell
ALTER TABLE my_table ADD COLUMN new_column String;
```

### 查看所有表

```shell
# 查看当前数据库中的所有表
SHOW TABLES;

# 如果你想查看其他数据库的表，可以指定数据库名
SHOW TABLES FROM your_database;
```

### 查看某个表的字段信息

```shell
DESCRIBE TABLE my_table;
```
