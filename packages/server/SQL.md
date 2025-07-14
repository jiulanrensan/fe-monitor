# 项目启动前初始化数据库步骤

## 创建数据库

```shell
CREATE DATABASE IF NOT EXISTS fre_monitor_db;
```

## 选择数据库

```
USE fre_monitor_db;
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

## 建表

### 接口耗时表

```shell
CREATE TABLE fre_monitor_db.api__duration
(
    pid LowCardinality(String) COMMENT '项目id',
    aid LowCardinality(String) COMMENT '应用id',
    sid String COMMENT '会话id 应用生命周期内唯一',
    uid String COMMENT '用户id',
    log_time DateTime64(3, 'Asia/Shanghai') COMMENT '记录时间',
    report_time DateTime64(3, 'Asia/Shanghai') COMMENT '上报时间',
    retry_times UInt8 COMMENT '重试次数',
    url String CODEC(ZSTD(5)),
    method LowCardinality(String),
    status_code UInt16 COMMENT 'HTTP 状态码',
    duration Float64 COMMENT '请求总耗时：含等待耗时、处理耗时',
    queue_time Float64 COMMENT '等待耗时',
    queue_start Int64 COMMENT '开始排队的时间戳',
    queue_end Int64 COMMENT '结束排队的时间戳',
    req_page LowCardinality(String) COMMENT '发起请求时的页面路径',
    res_page LowCardinality(String) COMMENT '获取到响应时的页面路径',
    network LowCardinality(String) COMMENT '请求时的网络状态',
    model LowCardinality(String) COMMENT '机型',
    platform LowCardinality(String) COMMENT '平台: broswer,wx',
    create_time DateTime DEFAULT now('Asia/Shanghai') COMMENT '插入表时间，INSERT时通过now()创建',

    INDEX duration_idx duration TYPE minmax GRANULARITY 3,
    INDEX url_idx url TYPE tokenbf_v1(65536, 4, 0) GRANULARITY 3,
    INDEX status_code_idx status_code TYPE minmax GRANULARITY 2
)
ENGINE = MergeTree()
PARTITION BY toYYYYMMDD(report_time)
ORDER BY (report_time, pid, aid)
TTL toDate(report_time) + INTERVAL 3 DAY
SETTINGS index_granularity = 8192;
```

### 接口请求体体积表

```shell
CREATE TABLE fre_monitor_db.api__body_size
(
    pid LowCardinality(String) COMMENT '项目id',
    aid LowCardinality(String) COMMENT '应用id',
    sid String COMMENT '会话id 应用生命周期内唯一',
    uid String COMMENT '用户id',
    log_time DateTime64(3, 'Asia/Shanghai') COMMENT '记录时间',
    report_time DateTime64(3, 'Asia/Shanghai') COMMENT '上报时间',
    retry_times UInt8 COMMENT '重试次数',
    url String CODEC(ZSTD(5)),
    method LowCardinality(String),
    status_code UInt16 COMMENT 'HTTP 状态码',
    req_body_size UInt16 COMMENT '请求body大小，单位kb',
    res_body_size UInt16 COMMENT '响应body大小，单位kb',
    model LowCardinality(String) COMMENT '机型',
    platform LowCardinality(String) COMMENT '平台: broswer,wx',
    create_time DateTime DEFAULT now('Asia/Shanghai') COMMENT '插入表时间，INSERT时通过now()创建',

    INDEX url_idx url TYPE tokenbf_v1(65536, 4, 0) GRANULARITY 3,
    INDEX status_code_idx status_code TYPE minmax GRANULARITY 2
)
ENGINE = MergeTree()
PARTITION BY toYYYYMMDD(report_time)
ORDER BY (report_time, pid, aid)
TTL toDate(report_time) + INTERVAL 3 DAY
SETTINGS index_granularity = 8192;
```

### 接口http错误表

```shell
CREATE TABLE fre_monitor_db.api__error_http_code
(
    pid LowCardinality(String) COMMENT '项目id',
    aid LowCardinality(String) COMMENT '应用id',
    sid String COMMENT '会话id 应用生命周期内唯一',
    uid String COMMENT '用户id',
    log_time DateTime64(3, 'Asia/Shanghai') COMMENT '记录时间',
    report_time DateTime64(3, 'Asia/Shanghai') COMMENT '上报时间',
    retry_times UInt8 COMMENT '重试次数',
    url String CODEC(ZSTD(5)),
    method LowCardinality(String),
    status_code UInt16 COMMENT 'HTTP 状态码',
    error_reason String COMMENT '失败原因',
    model LowCardinality(String) COMMENT '机型',
    platform LowCardinality(String) COMMENT '平台: broswer,wx',
    create_time DateTime DEFAULT now('Asia/Shanghai') COMMENT '插入表时间，INSERT时通过now()创建',

    INDEX url_idx url TYPE tokenbf_v1(65536, 4, 0) GRANULARITY 3,
    INDEX status_code_idx status_code TYPE minmax GRANULARITY 2
)
ENGINE = MergeTree()
PARTITION BY toYYYYMMDD(report_time)
ORDER BY (report_time, pid, aid)
TTL toDate(report_time) + INTERVAL 3 DAY
SETTINGS index_granularity = 8192;
```

### 接口业务异常码表

```shell
CREATE TABLE fre_monitor_db.api__error_business_code
(
    pid LowCardinality(String) COMMENT '项目id',
    aid LowCardinality(String) COMMENT '应用id',
    sid String COMMENT '会话id 应用生命周期内唯一',
    uid String COMMENT '用户id',
    log_time DateTime64(3, 'Asia/Shanghai') COMMENT '记录时间',
    report_time DateTime64(3, 'Asia/Shanghai') COMMENT '上报时间',
    retry_times UInt8 COMMENT '重试次数',
    url String CODEC(ZSTD(5)),
    method LowCardinality(String),
    status_code UInt16 COMMENT 'HTTP 状态码',
    error_code UInt16 COMMENT '业务异常码',
    error_reason String COMMENT '失败原因',
    model LowCardinality(String) COMMENT '机型',
    platform LowCardinality(String) COMMENT '平台: broswer,wx',
    create_time DateTime DEFAULT now('Asia/Shanghai') COMMENT '插入表时间，INSERT时通过now()创建',

    INDEX url_idx url TYPE tokenbf_v1(65536, 4, 0) GRANULARITY 3,
    INDEX status_code_idx status_code TYPE minmax GRANULARITY 2
)
ENGINE = MergeTree()
PARTITION BY toYYYYMMDD(report_time)
ORDER BY (report_time, pid, aid)
TTL toDate(report_time) + INTERVAL 3 DAY
SETTINGS index_granularity = 8192;
```

### 前端日志表

```shell
CREATE TABLE fre_monitor_db.fre_log
(
    pid LowCardinality(String) COMMENT '项目id',
    aid LowCardinality(String) COMMENT '应用id',
    sid String COMMENT '会话id 应用生命周期内唯一',
    uid String COMMENT '用户id',
    log_time DateTime64(3, 'Asia/Shanghai') COMMENT '记录时间',
    report_time DateTime64(3, 'Asia/Shanghai') COMMENT '上报时间',
    retry_times UInt8 COMMENT '重试次数',
    model LowCardinality(String) COMMENT '机型',
    platform LowCardinality(String) COMMENT '平台: broswer,wx',
    create_time DateTime DEFAULT now('Asia/Shanghai') COMMENT '插入表时间，INSERT时通过now()创建',
    log_type LowCardinality(String) COMMENT '日志级别: log,error',
    log_content String COMMENT '日志内容' CODEC(ZSTD(5)),
    log_keywords String COMMENT '日志关键字'
)
ENGINE = MergeTree()
PARTITION BY toYYYYMMDD(report_time)
ORDER BY (report_time, pid, aid)
TTL toDate(report_time) + INTERVAL 3 DAY
SETTINGS index_granularity = 8192;
```

# 告警sql

```shell
SELECT
    url,
    count() AS count,
    quantile(0.50)(duration) AS median,
    quantile(0.95)(duration) AS p95,
    quantile(0.99)(duration) AS p99
FROM fre_monitor_db.api__duration
WHERE report_time >= '2025-07-03 00:00:00'
AND report_time <= '2025-07-03 23:59:59'
AND aid = 'app_001'
AND duration >= 200
GROUP BY url
HAVING count > 2
```
