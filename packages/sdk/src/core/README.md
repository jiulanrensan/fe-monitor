# 回调策略模式使用指南

## 概述

回调策略模式用于处理插件数据的不同发送方式，支持灵活扩展新的策略。策略管理器使用泛型支持类型安全。

## 现有策略

### 1. 缓存策略 (CACHE)

- **类型**: `CALLBACK_TYPE.CACHE`
- **行为**: 数据通过缓存队列处理，支持批量发送
- **适用场景**: 普通事件监控，对实时性要求不高的数据

### 2. 直接发送策略 (DIRECT_SEND)

- **类型**: `CALLBACK_TYPE.DIRECT_SEND`
- **行为**: 数据直接调用 send 方法，跳过缓存队列
- **适用场景**: 应用隐藏/显示事件，错误日志，对实时性要求高的数据

## 使用方法

### 在插件中使用

```typescript
import { CALLBACK_TYPE } from '@/core/constant'

function myPlugin(): BasePluginType {
  return {
    name: 'myPlugin',
    monitor(notify: AnyFunc) {
      // 使用缓存策略（默认）
      wx.onSomeEvent(() => {
        notify({
          type: MONITOR_TYPE.FRE_LOG,
          subType: 'SOME_EVENT',
          data: 'some data'
        })
      })

      // 使用直接发送策略
      wx.onCriticalEvent(() => {
        notify(
          {
            type: MONITOR_TYPE.ERROR,
            subType: 'CRITICAL_ERROR',
            error: 'critical error'
          },
          CALLBACK_TYPE.DIRECT_SEND
        )
      })
    }
  }
}
```

## 扩展新策略（类型安全）

### 1. 定义新策略类

```typescript
import { CallbackStrategy } from '@/core/callback-strategy'
import { IAnyObject } from '@/core/type'
import { WXCore } from '@/wx'

// 为特定的 Core 类型创建策略
class CustomWXStrategy implements CallbackStrategy<WXCore> {
  async execute(core: WXCore, data: IAnyObject): Promise<void> {
    try {
      // 可以访问 WXCore 特有的方法和属性
      const options = core.getOptions()

      // 自定义处理逻辑
      const customData = {
        ...data,
        customField: 'custom value',
        timestamp: Date.now()
      }

      await core.send(customData)
    } catch (error) {
      console.error('Custom strategy failed:', error)
    }
  }
}
```

### 2. 在常量文件中添加新类型

```typescript
export enum CALLBACK_TYPE {
  CACHE = 'CACHE',
  DIRECT_SEND = 'DIRECT_SEND',
  CUSTOM_WX = 'CUSTOM_WX' // 新增
}
```

### 3. 注册新策略

```typescript
// 在 Core 类中注册新策略
const strategyManager = new CallbackStrategyManager<Core<Options>>()
strategyManager.registerStrategy(CALLBACK_TYPE.CUSTOM_WX, new CustomWXStrategy())
```

### 4. 使用新策略

```typescript
notify(data, CALLBACK_TYPE.CUSTOM_WX)
```

## 策略管理器 API

### 构造函数

```typescript
// 使用默认类型
const manager = new CallbackStrategyManager()

// 指定具体类型
const manager = new CallbackStrategyManager<WXCore>()
```

### registerStrategy(type: string, strategy: CallbackStrategy<CoreType>)

注册新的策略类型

```typescript
const manager = new CallbackStrategyManager<WXCore>()
manager.registerStrategy('my_custom_type', new MyCustomStrategy())
```

### execute(type: string, core: CoreType, data: IAnyObject)

执行指定类型的策略

```typescript
manager.execute('my_custom_type', coreInstance, data)
```

## 类型安全特性

1. **泛型支持**: 策略管理器支持泛型，可以为特定的 Core 类型提供类型安全
2. **接口约束**: 所有策略都必须实现 `CallbackStrategy` 接口
3. **方法访问**: 在策略中可以安全地访问 Core 实例的方法和属性
4. **编译时检查**: TypeScript 会在编译时检查类型错误

## 注意事项

1. 策略类型不区分大小写
2. 如果指定的策略类型不存在，会回退到缓存策略
3. 所有策略都应该实现 `CallbackStrategy` 接口
4. 策略执行过程中的错误会被捕获并记录
5. 使用泛型可以获得更好的类型安全性和 IDE 支持
