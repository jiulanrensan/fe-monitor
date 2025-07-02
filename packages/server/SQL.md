# 项目启动前初始化数据库步骤

## 创建数据库

```shell
CREATE DATABASE IF NOT EXISTS fre_monitor_db;
```

## 选择数据库

```
USE fre_monitor_db;
```

## 建表

### 慢接口表

```shell
CREATE TABLE fre_monitor_db.slow_request
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

## 创建用户

```shell
CREATE USER IF NOT EXISTS fre_monitor_user
IDENTIFIED WITH sha256_password BY 'Password123!';
```

## 分配权限

```shell
GRANT SELECT ON fre_monitor_db.* TO fre_monitor_user
```
