# 定时任务模块 (Scheduler Module)

## 概述

定时任务模块用于定期监控API性能指标，当发现异常时自动触发告警。该模块采用事件注册模式，方便后续扩展新的监控事件。

## 功能特性

- 🕐 每10分钟自动执行监控任务
- 📊 监控4种API指标：耗时、请求体大小、HTTP错误码、业务错误码
- 🔔 自动告警机制（当前为空实现，可扩展）
- 🎯 事件注册模式，易于扩展
- 🎮 支持手动触发监控
- ⚙️ 可配置的监控参数

## 模块结构

```
scheduler/
├── scheduler.module.ts      # 模块定义
├── scheduler.service.ts     # 定时任务服务
├── scheduler.controller.ts  # API控制器
├── event-registry.ts       # 事件注册器
├── alert.service.ts        # 告警服务
├── monitor.config.ts       # 监控配置
└── README.md              # 说明文档
```

## 监控事件

### 1. API耗时监控 (api-duration-monitor)

- 监控API请求耗时超过阈值的接口
- 默认阈值：5000ms
- 默认告警阈值：5次

### 2. API请求体大小监控 (api-body-size-monitor)

- 监控请求体或响应体大小超过阈值的接口
- 默认阈值：1MB
- 默认告警阈值：5次

### 3. API错误HTTP状态码监控 (api-error-http-code-monitor)

- 监控HTTP状态码异常的接口
- 默认监控：400及以上状态码
- 默认告警阈值：5次

### 4. API错误业务码监控 (api-error-business-code-monitor)

- 监控业务错误码异常的接口
- 默认监控：1001, 1002, 1003
- 默认告警阈值：5次

## API接口

### 手动触发监控

#### 触发所有监控事件

```http
POST /scheduler/trigger-all
```

#### 触发指定监控事件

```http
POST /scheduler/trigger/{eventName}
```

支持的eventName：

- `api-duration-monitor`
- `api-body-size-monitor`
- `api-error-http-code-monitor`
- `api-error-business-code-monitor`

#### 获取所有注册的监控事件

```http
GET /scheduler/events
```

#### 健康检查

```http
GET /scheduler/health
```

## 配置说明

监控参数在 `monitor.config.ts` 中配置：

```typescript
export const defaultMonitorConfig: MonitorConfig = {
  defaultAid: 'default', // 默认应用ID
  defaultThreshold: 5, // 默认告警阈值

  apiDuration: {
    duration: 5000, // 耗时阈值（毫秒）
    threshold: 5, // 告警阈值
  },

  apiBodySize: {
    reqBodySize: 1024 * 1024, // 请求体大小阈值（字节）
    resBodySize: 1024 * 1024, // 响应体大小阈值（字节）
    threshold: 5,
  },

  apiErrorHttpCode: {
    statusCode: 400, // 监控的状态码
    useGreaterEqual: true, // 是否监控大于等于该状态码
    threshold: 5,
  },

  apiErrorBusinessCode: {
    errorCodes: [1001, 1002, 1003], // 需要监控的业务错误码
    threshold: 5,
  },
};
```

## 扩展新监控事件

1. 在 `scheduler.service.ts` 中添加新的监控方法
2. 在 `registerMonitorEvents()` 方法中注册新事件
3. 在 `monitor.config.ts` 中添加配置项
4. 在告警服务中实现具体的告警逻辑

### 示例：添加新监控事件

```typescript
// 1. 添加监控方法
private async monitorNewEvent(): Promise<void> {
  // 实现监控逻辑
}

// 2. 注册事件
this.eventRegistry.registerEvent({
  name: 'new-event-monitor',
  description: '监控新事件',
  handler: () => this.monitorNewEvent(),
});
```

## 告警扩展

当前告警逻辑为空实现，可以在 `alert.service.ts` 中扩展：

- 邮件告警
- 短信告警
- 钉钉/企业微信告警
- Webhook告警
- 数据库记录

## 依赖安装

确保已安装 `@nestjs/schedule` 依赖：

```bash
pnpm add @nestjs/schedule
```

## 使用说明

1. 模块已集成到主应用中，启动后会自动开始定时监控
2. 可以通过API接口手动触发监控
3. 监控日志会输出到控制台
4. 告警逻辑需要根据实际需求实现
