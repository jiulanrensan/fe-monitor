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
    create_time DateTime DEFAULT now() COMMENT '插入表时间，INSERT时通过now()创建',

    INDEX duration_idx duration TYPE minmax GRANULARITY 3,
    INDEX url_idx url TYPE tokenbf_v1(65536, 4, 0) GRANULARITY 3,
    INDEX status_code_idx status_code TYPE minmax GRANULARITY 2
)
ENGINE = MergeTree()
PARTITION BY toYYYYMMDD(report_time)
ORDER BY (report_time, aid)
TTL report_time + INTERVAL 7 DAY
SETTINGS index_granularity = 8192;
```

### 接口请求体体积表

```shell
CREATE TABLE fre_monitor_db.api__body_size
(
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
    create_time DateTime DEFAULT now() COMMENT '插入表时间，INSERT时通过now()创建',

    INDEX url_idx url TYPE tokenbf_v1(65536, 4, 0) GRANULARITY 3,
    INDEX status_code_idx status_code TYPE minmax GRANULARITY 2
)
ENGINE = MergeTree()
PARTITION BY toYYYYMMDD(report_time)
ORDER BY (report_time, aid)
TTL report_time + INTERVAL 7 DAY
SETTINGS index_granularity = 8192;
```

### 接口http错误表

```shell
CREATE TABLE fre_monitor_db.api__error_http_code
(
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
    create_time DateTime DEFAULT now() COMMENT '插入表时间，INSERT时通过now()创建',

    INDEX url_idx url TYPE tokenbf_v1(65536, 4, 0) GRANULARITY 3,
    INDEX status_code_idx status_code TYPE minmax GRANULARITY 2
)
ENGINE = MergeTree()
PARTITION BY toYYYYMMDD(report_time)
ORDER BY (report_time, aid)
TTL report_time + INTERVAL 7 DAY
SETTINGS index_granularity = 8192;
```

### 接口业务异常码表

```shell
CREATE TABLE fre_monitor_db.api__error_business_code
(
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
    create_time DateTime DEFAULT now() COMMENT '插入表时间，INSERT时通过now()创建',

    INDEX url_idx url TYPE tokenbf_v1(65536, 4, 0) GRANULARITY 3,
    INDEX status_code_idx status_code TYPE minmax GRANULARITY 2
)
ENGINE = MergeTree()
PARTITION BY toYYYYMMDD(report_time)
ORDER BY (report_time, aid)
TTL report_time + INTERVAL 7 DAY
SETTINGS index_granularity = 8192;
```
