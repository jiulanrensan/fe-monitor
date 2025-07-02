# 在docker中使用clickhouse

[使用 Docker 安装 ClickHouse](https://clickhouse.com/docs/zh/install/docker)

```shell
# 拉取
docker pull clickhouse/clickhouse-server

# 启动服务器实例
docker run -d --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
```

默认情况下，ClickHouse 只能通过 Docker 网络访问
默认情况下，启动的上述服务器实例将作为 `default` 用户运行，无需密码

```shell
# 从本地客户端连接
docker exec -it some-clickhouse-server clickhouse-client
```

此时进入client服务，可以执行sql语句

## 连接 Docker 中运行的 ClickHouse

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
    userid String
)
ENGINE = MergeTree()
ORDER BY (timestamp, userid);
```

执行结果

```
Query id: 448305f4-f523-4352-b06f-cd4d38c00934

Ok.

0 rows in set. Elapsed: 0.010 sec.
```

### 存在某个表

```shell
EXISTS TABLE slow_request;
```

执行结果

```
Query id: e42d158c-063d-4f86-8c34-19f426719547

   ┌─result─┐
1. │      1 │
   └────────┘

1 row in set. Elapsed: 0.001 sec.
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
