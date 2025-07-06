# FE Monitor Shared Package

这个包包含了 FE Monitor 项目中共享的工具和服务，目前主要提供 ClickHouse 数据库服务。

## 功能特性

### ClickHouse 服务

- **ClickHouseService**: 提供完整的数据库操作接口
- **ClickHouseHealthService**: 提供连接健康检查和监控
- **ClickHouseModule**: 全局模块，自动处理连接初始化

## 安装和使用

### 1. 导入模块

在你的 NestJS 应用中导入 `ClickHouseModule`：

```typescript
import { ClickHouseModule } from '../../shared/src/clickhouse'

@Module({
  imports: [ClickHouseModule]
  // ...
})
export class AppModule {}
```

### 2. 使用 ClickHouseService

```typescript
import { ClickHouseService } from '../../shared/src/clickhouse'

@Injectable()
export class YourService {
  constructor(private readonly clickHouseService: ClickHouseService) {}

  async queryData() {
    // 执行查询
    const result = await this.clickHouseService.query('SELECT * FROM your_table')
    return result
  }

  async insertData(data: any[]) {
    // 插入数据
    const result = await this.clickHouseService.insert('your_table', data)
    return result
  }

  async batchInsertData(data: any[]) {
    // 批量插入数据
    const result = await this.clickHouseService.batchInsert('your_table', data, 1000)
    return result
  }
}
```

### 3. 使用 ClickHouseHealthService

```typescript
import { ClickHouseHealthService } from '../../shared/src/clickhouse'

@Injectable()
export class HealthCheckService {
  constructor(private readonly healthService: ClickHouseHealthService) {}

  async checkHealth() {
    // 检查连接状态
    const isConnected = await this.healthService.checkConnection()

    // 获取详细健康状态
    const healthStatus = await this.healthService.getHealthStatus()

    // 等待连接就绪
    const isReady = await this.healthService.waitForConnection()

    return { isConnected, healthStatus, isReady }
  }
}
```

## 环境变量配置

确保设置以下环境变量：

```bash
CLICKHOUSE_HOST=localhost
CLICKHOUSE_PORT=8123
CLICKHOUSE_USER=default
CLICKHOUSE_PASSWORD=your_password
CLICKHOUSE_DB=your_database
CLICKHOUSE_MAX_CONNECTIONS=50
```

## API 参考

### ClickHouseService

#### query<T>(query: string, options?: QueryOptions): Promise<T[]>

执行 SQL 查询语句

#### insert(table: string, data: any[], options?: InsertOptions): Promise<InsertResult>

插入数据到指定表

#### batchInsert(table: string, data: any[], batchSize?: number, options?: InsertOptions): Promise<InsertResult[]>

批量插入数据，支持分批处理

#### update(query: string, options?: QueryOptions): Promise<any>

执行更新操作

#### delete(query: string, options?: QueryOptions): Promise<any>

执行删除操作

#### ping(): Promise<boolean>

检查连接状态

#### getClient(): ClickHouseClient

获取 ClickHouse 客户端实例

### ClickHouseHealthService

#### checkConnection(retryCount?: number): Promise<boolean>

检查连接状态，支持重试

#### getHealthStatus(): Promise<HealthStatus>

获取详细的健康状态信息

#### waitForConnection(maxWaitTime?: number, checkInterval?: number): Promise<boolean>

等待连接就绪

## 错误处理

所有服务都包含完整的错误处理和日志记录。错误会被抛出，你可以在调用方进行捕获和处理：

```typescript
try {
  const result = await this.clickHouseService.query('SELECT * FROM table')
  return result
} catch (error) {
  // 处理错误
  console.error('Query failed:', error.message)
  throw error
}
```

## 性能优化

- 使用 `batchInsert` 进行批量插入以提高性能
- 连接池自动管理，支持配置最大连接数
- 自动重试机制确保连接稳定性

## 开发

这是一个 monorepo 项目，shared 目录使用根目录的依赖和配置。

### 构建

```bash
# 在根目录执行
pnpm build:server
```

### 开发模式

```bash
# 在根目录执行
pnpm dev:read-server  # 启动 micro-service-read
pnpm dev:write-server # 启动 micro-service-write
```
