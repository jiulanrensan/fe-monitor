# ClickHouse 模块抽离到 Shared 目录

## 概述

本次重构将 `micro-service-read` 中的 ClickHouse 相关逻辑抽离到 `shared` 目录，使其可以被 `micro-service-read` 和 `micro-service-write` 两个微服务共享使用。

## 抽离的文件结构

### 原始位置 (micro-service-read)

```
packages/server/micro-service-read/src/clickhouse/
├── clickhouse.service.ts
├── clickhouse.module.ts
├── clickhouse.provider.ts
└── clickhouse-health.service.ts
```

### 新位置 (shared)

```
packages/server/shared/src/clickhouse/
├── clickhouse.service.ts      # 增强的数据库服务
├── clickhouse.module.ts       # 全局模块
├── clickhouse.provider.ts     # 客户端提供者
├── clickhouse-health.service.ts # 健康检查服务
└── index.ts                   # 导出文件
```

**注意**: shared 目录作为 monorepo 的一部分，使用根目录的依赖和配置，无需独立的 package.json 和 tsconfig.json。

## 主要改进

### 1. 增强的 ClickHouseService

**新增功能：**

- `batchInsert()`: 批量插入，支持分批处理大数据量
- `update()`: 更新操作
- `delete()`: 删除操作
- `ping()`: 连接状态检查
- `getClient()`: 获取原始客户端实例

**改进的错误处理：**

- 统一的错误日志格式
- 异常抛出而不是静默失败
- 更好的类型支持

### 2. 增强的 ClickHouseHealthService

**新增功能：**

- `getHealthStatus()`: 获取详细健康状态
- `waitForConnection()`: 等待连接就绪
- 可配置的重试机制

### 3. 灵活的配置支持

**ClickHouseConfig 接口：**

```typescript
export interface ClickHouseConfig {
  host: string
  port: string
  username: string
  password: string
  database: string
  maxOpenConnections?: number
}
```

支持通过环境变量或直接配置进行自定义。

## 迁移步骤

### 1. 更新 micro-service-read

**app.module.ts 变更：**

```typescript
// 旧代码
import { ClickHouseModule } from './clickhouse/clickhouse.module'
import { ClickHouseHealthService } from './clickhouse/clickhouse-health.service'

// 新代码
import { ClickHouseModule, ClickHouseHealthService } from '../../shared/src/clickhouse'
```

**删除原有文件：**

- `packages/server/micro-service-read/src/clickhouse/` 目录及其所有文件

### 2. 更新 micro-service-write

**app.module.ts 变更：**

```typescript
import { ClickHouseModule, ClickHouseHealthService } from '../../shared/src/clickhouse'

@Module({
  imports: [ClickHouseModule],
  controllers: [AppController],
  providers: [AppService, DataService]
})
export class AppModule implements OnApplicationBootstrap {
  constructor(private readonly healthService: ClickHouseHealthService) {}

  async onApplicationBootstrap() {
    const isConnected = await this.healthService.checkConnection()
    if (!isConnected) {
      this.logger.fatal('ClickHouse connection failed')
      process.exit(1)
    }
  }
}
```

**新增 DataService 示例：**
展示了如何在 micro-service-write 中使用共享的 ClickHouse 服务进行数据插入和查询操作。

## 使用示例

### 在 micro-service-read 中使用

```typescript
import { ClickHouseService } from '../../shared/src/clickhouse'

@Injectable()
export class QueryService {
  constructor(private readonly clickHouseService: ClickHouseService) {}

  async getMonitorData() {
    return await this.clickHouseService.query(
      'SELECT * FROM monitor_events WHERE timestamp > now() - INTERVAL 1 HOUR'
    )
  }
}
```

### 在 micro-service-write 中使用

```typescript
import { ClickHouseService } from '../../shared/src/clickhouse'

@Injectable()
export class DataService {
  constructor(private readonly clickHouseService: ClickHouseService) {}

  async insertMonitorData(data: any[]) {
    return await this.clickHouseService.batchInsert(
      'monitor_events',
      data,
      1000 // 批次大小
    )
  }
}
```

## 环境变量配置

确保两个微服务都配置了相同的环境变量：

```bash
CLICKHOUSE_HOST=localhost
CLICKHOUSE_PORT=8123
CLICKHOUSE_USER=default
CLICKHOUSE_PASSWORD=your_password
CLICKHOUSE_DB=your_database
CLICKHOUSE_MAX_CONNECTIONS=50
```

## 优势

1. **代码复用**: 避免在两个微服务中重复相同的 ClickHouse 逻辑
2. **统一维护**: 所有 ClickHouse 相关的改进和修复只需要在一个地方进行
3. **功能增强**: 提供了更多实用的方法，如批量插入、健康检查等
4. **更好的错误处理**: 统一的错误处理和日志记录
5. **类型安全**: 完整的 TypeScript 类型支持
6. **配置灵活**: 支持环境变量和直接配置两种方式

## 注意事项

1. 确保两个微服务都正确导入了 `ClickHouseModule`
2. 环境变量配置必须一致
3. 如果需要在某个微服务中使用特殊的 ClickHouse 配置，可以通过 `createClickHouseClient(config)` 创建自定义提供者
4. 所有 ClickHouse 操作都应该包含适当的错误处理

## 后续扩展

shared 目录可以继续扩展其他共享功能：

- 数据库迁移工具
- 数据验证器
- 通用 DTO 和接口
- 工具函数库
- 中间件和守卫
