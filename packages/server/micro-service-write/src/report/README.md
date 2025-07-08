# 自动化 DTO 映射系统 + 缓存队列系统

## 概述

这个系统包含两个核心功能：

1. **自动化 DTO 映射系统**: 直接从 DTO 类的定义中自动获取所有字段（包括继承的字段），无需手动声明字段列表，实现真正的自动化字段提取。核心逻辑已抽离到 `shared` 包中，便于复用。

2. **缓存队列系统**: 为减少与数据库的IO操作，系统实现了缓存队列机制，为每个数据表维护独立的队列，当满足条件时自动批量插入数据。

## 架构设计

### 1. Shared 包核心组件

#### `@/shared/src/utils/dto-extractor.util.ts`

- `getAllDtoProperties()`: 从 DTO 类定义中获取所有属性（包括继承链）
- `extractFieldsFromDto()`: 通过 DTO 类自动提取字段并转换为下划线命名

#### `@/shared/src/utils/report.util.ts`

- `extractDataFromDto()`: 通用的字段提取方法，返回提取的字段和表名

#### `@/shared/src/decorators/clickhouse-table.decorator.ts`

- `@ClickHouseTable()`: 装饰器，标记 DTO 类对应的 ClickHouse 表名
- `getClickHouseTable()`: 获取 DTO 类对应的表名

### 2. 职责分离

#### Shared 包职责（字段提取）

- 从 DTO 类定义中获取所有字段
- 从原始数据中提取对应字段
- 进行字段命名转换（驼峰 → 下划线）
- 获取对应的表名

#### Service 职责（数据库操作）

- 调用 shared 包的方法获取提取的数据
- 执行数据库插入操作
- 处理错误和日志记录
- 业务逻辑控制

### 3. 缓存队列系统

#### 核心组件

- **QueueCacheService**: 缓存队列服务，管理所有表的队列
- **QueueCacheController**: 队列监控和管理接口
- **queue.config.ts**: 队列配置文件，定义不同表的默认配置

#### 触发条件

队列会在以下两个条件之一满足时触发批量插入：

1. **队列长度达到阈值**: 当队列中的数据量达到配置的 `maxSize` 时
2. **时间间隔到达**: 当距离上次插入的时间达到配置的 `flushInterval` 时（使用 setTimeout 避免重叠执行）

#### 配置参数

```typescript
interface QueueConfig {
  maxSize: number // 队列最大长度
  flushInterval: number // 刷新间隔（毫秒）
  retryAttempts?: number // 重试次数
  retryDelay?: number // 重试延迟（毫秒）
  minFlushSize?: number // 定时器触发时的最小刷新数量
  maxTimerSkips?: number // 定时器最大跳过次数
  maxDataAge?: number // 数据最大年龄（毫秒）
}
```

#### 表特定配置

- **performance_metrics**: 高频数据，3秒刷新，50条批量
- **error_logs**: 重要数据，2秒刷新，20条批量，5次重试
- **API相关表**: 中等频率，4秒刷新，60-80条批量

#### 定时器机制

- 使用 `setTimeout` 而不是 `setInterval`，避免定时器重叠执行
- 每次执行完成后重新启动定时器，确保间隔准确
- 智能跳过策略：
  - 如果队列长度小于 `minFlushSize`（默认maxSize的1/4），则跳过刷新
  - 如果连续跳过次数超过 `maxTimerSkips`（默认3次），则强制刷新
  - 如果数据在队列中停留时间超过 `maxDataAge`（默认30秒），则强制刷新
- 确保数据不会因为上报频率低而长期积压在内存中

### 4. 直接从类定义获取字段

系统会自动分析 DTO 类的继承链，获取所有字段：

```typescript
@ClickHouseTable(API_DURATION_TABLE)
export class ApiDurationReportDto extends APIDto {
  @IsNumber()
  duration: number

  @IsString()
  reqPage: string

  // ... 其他字段
}
```

系统会自动获取：

- `BaseDto` 的字段：`aid`, `sid`, `uid`, `logTime`, `reportTime`, `retryTimes`, `model`
- `APIDto` 的字段：`url`, `method`, `statusCode`
- `ApiDurationReportDto` 的字段：`duration`, `queueTime`, `queueStart`, `queueEnd`, `reqPage`, `resPage`, `network`

### 5. 服务方法实现

`reportApiDuration()` 方法现在使用缓存队列系统：

```typescript
async reportApiDuration(data: any): Promise<void> {
  this.logger.log(`reportApiDuration: ${JSON.stringify(data)}`)

  // 使用缓存队列系统，数据会自动推入队列
  return this.report(data, ApiDurationReportDto)
}

// 通用的报告方法现在使用队列
private async report<T extends Record<string, any>>(
  data: any,
  dtoClass: new (...args: any[]) => T,
  tableName?: string,
  methodName?: string
): Promise<void> {
  const className = dtoClass.name
  const logMethodName = methodName || className

  try {
    const { extractedData, tableName: decoratorTableName } = extractDataFromDto(data, dtoClass)
    const targetTable = tableName || decoratorTableName

    if (!targetTable) {
      throw new Error(`No table mapping found for ${className}`)
    }

    // 将数据推入缓存队列，而不是直接插入数据库
    await this.queueCacheService.push(targetTable, extractedData)

    this.logger.log(`Data queued for ${className} to table ${targetTable}`)
  } catch (error) {
    this.logger.error(`Failed to queue ${logMethodName} data: ${error.message}`, error.stack)
    throw error
  }
}
```

## 使用方式

### 方式1：直接传入原始数据（推荐）

```typescript
// 原始数据（可以是任何对象）
const rawData = {
  aid: 'app123',
  sid: 'session456',
  uid: 'user789',
  logTime: '2024-01-01T00:00:00Z',
  reportTime: '2024-01-01T00:00:01Z',
  retryTimes: 0,
  model: 'test-model',
  url: '/api/test',
  method: 'GET',
  statusCode: 200,
  duration: 150,
  queueTime: 10,
  queueStart: 1000,
  queueEnd: 1010,
  reqPage: '/page1',
  resPage: '/page2',
  network: '4G',
  // 其他字段会被自动忽略
  extraField: 'ignored'
}

// 系统会自动：
// 1. 分析 ApiDurationReportDto 的继承链
// 2. 获取所有字段定义
// 3. 从原始数据中提取对应字段
// 4. 将字段名转换为下划线格式
// 5. 插入到正确的 ClickHouse 表中
await this.reportService.reportApiDuration(rawData)
```

### 方式2：使用其他报告方法

```typescript
// API 业务错误
await this.reportService.reportApiErrorBusinessCode({
  aid: 'app123',
  url: '/api/test',
  method: 'POST',
  statusCode: 400,
  errorCode: 1001,
  errorReason: '参数错误'
})

// API Body 大小
await this.reportService.reportApiBodySize({
  aid: 'app123',
  url: '/api/test',
  method: 'POST',
  statusCode: 200,
  reqBodySize: 1024,
  resBodySize: 2048
})
```

## 自动化特性

### 1. 智能继承链分析

- 自动遍历整个继承链（BaseDto → APIDto → ApiDurationReportDto）
- 获取每个类中的所有字段
- 支持任意深度的继承

### 2. 自动字段映射

- 驼峰命名 → 下划线命名
- 保持数据完整性
- 符合 ClickHouse 命名规范

### 3. 自动表名获取

- 通过 `@ClickHouseTable` 装饰器自动获取表名
- 无需手动维护映射关系
- 编译时错误检查

### 4. 职责分离

- **Shared 包**：负责字段提取和转换逻辑
- **Service 层**：负责数据库操作和业务逻辑
- 代码复用：字段提取逻辑可在多个服务中复用
- 灵活控制：每个服务可以自定义数据库操作逻辑

## 支持的 DTO 类型

| DTO 类                          | 表名                      | 自动获取的字段                              |
| ------------------------------- | ------------------------- | ------------------------------------------- |
| `ApiDurationReportDto`          | `api_duration`            | BaseDto + APIDto + duration相关字段         |
| `ApiErrorBusinessCodeReportDto` | `api_error_business_code` | BaseDto + APIDto + errorCode, errorReason   |
| `ApiErrorHttpCodeReportDto`     | `api_error_http_code`     | BaseDto + APIDto + error_reason             |
| `ApiBodySizeReportDto`          | `api_body_size`           | BaseDto + APIDto + reqBodySize, resBodySize |

## 优势

1. **真正的自动化**：直接从类定义获取字段，无需手动声明
2. **继承感知**：自动处理整个继承链中的所有字段
3. **职责分离**：字段提取和数据库操作分离，便于维护
4. **代码复用**：字段提取逻辑在 shared 包中，便于复用
5. **灵活控制**：每个服务可以自定义数据库操作逻辑
6. **类型安全**：基于 TypeScript 类系统
7. **易于维护**：字段变化时自动适应，无需修改服务代码
8. **灵活输入**：接受任何包含所需字段的对象
9. **调试友好**：详细的日志输出帮助诊断问题

## 缓存队列系统 API 接口

### 获取队列状态

```http
GET /queue-cache/status
```

返回所有队列的当前状态和配置信息。

### 手动刷新所有队列

```http
POST /queue-cache/flush
```

立即刷新所有队列中的数据到数据库。

### 手动刷新指定表的队列

```http
POST /queue-cache/flush/{tableName}
```

立即刷新指定表队列中的数据到数据库。

### 配置表队列参数

```http
PUT /queue-cache/configure/{tableName}
Content-Type: application/json

{
  "maxSize": 50,
  "flushInterval": 3000,
  "retryAttempts": 2,
  "minFlushSize": 10,
  "maxTimerSkips": 5,
  "maxDataAge": 60000
}
```

动态配置指定表的队列参数。

#### 配置参数说明

- **maxSize**: 队列最大长度，达到此值时立即刷新
- **flushInterval**: 定时器刷新间隔（毫秒）
- **retryAttempts**: 插入失败时的重试次数
- **retryDelay**: 重试间隔（毫秒）
- **minFlushSize**: 定时器触发时的最小刷新数量（默认maxSize的1/4）
- **maxTimerSkips**: 定时器最大跳过次数（默认3次）
- **maxDataAge**: 数据最大年龄（毫秒，默认30秒）

## 错误处理

- 插入失败时会自动重试，重试次数可配置
- 重试失败后数据会重新放回队列
- 所有错误都会记录到日志中

## 资源清理

服务实现了 `OnModuleDestroy` 接口，在模块销毁时会：

1. 刷新所有队列中的数据
2. 清除所有定时器
3. 清理内存资源

确保数据不会丢失。

## 调试信息

系统会输出详细的调试信息：

```
reportApiDuration: {"aid":"app123","sid":"session456",...}
Report ApiDurationReportDto success: {"inserted_rows":1}
```

## 添加新的 DTO

要添加新的 DTO 类型，只需要：

1. 创建 DTO 类（继承 BaseDto 或其他基类）
2. 添加 `@ClickHouseTable` 装饰器定义表名
3. 在服务中添加对应的报告方法

```typescript
// 1. 创建 DTO
@ClickHouseTable('your_table_name')
export class YourNewDto extends BaseDto {
  @IsString()
  yourField1: string

  @IsNumber()
  yourField2: number
}

// 2. 在服务中添加方法
async reportYourNew(data: any): Promise<void> {
  try {
    const { extractedData, tableName } = extractDataFromDto(data, YourNewDto)

    if (!tableName) {
      throw new Error(`No table mapping found for YourNewDto`)
    }

    const mappedData = [extractedData]
    const res = await this.clickHouseService.insert(tableName, mappedData)

    this.logger.log(`Report YourNewDto success: ${JSON.stringify(res?.summary)}`)
  } catch (error) {
    this.logger.error(`Failed to report YourNewDto data: ${error.message}`, error.stack)
    throw error
  }
}

// 3. 使用
await this.reportService.reportYourNew(yourData)
```

系统会自动获取 `BaseDto` 的所有字段 + `YourNewDto` 的所有字段！
