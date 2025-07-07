import {
  API_BODY_SIZE_TABLE,
  API_DURATION_TABLE,
  API_ERROR_BUSINESS_CODE_TABLE,
  API_ERROR_HTTP_CODE_TABLE
} from 'shared/src'
import { QueueConfig } from './queue-cache.service'

/**
 * 默认队列配置
 */
export const DEFAULT_QUEUE_CONFIG: QueueConfig = {
  maxSize: 100,
  flushInterval: 30000, // 30秒
  retryAttempts: 3,
  retryDelay: 1000 // 1秒
}

/**
 * todo 抽离到配置文件中
 * 不同表的特定配置
 */
export const TABLE_QUEUE_CONFIGS: Record<string, Partial<QueueConfig>> = {
  // 后续再考虑
  // 性能监控数据 - 高频数据，需要更频繁的刷新
  //   performance_metrics: {
  //     maxSize: 50,
  //     flushInterval: 3000, // 3秒
  //     retryAttempts: 2
  //   },

  //   // 错误日志 - 重要数据，需要更可靠的处理
  //   error_logs: {
  //     maxSize: 20,
  //     flushInterval: 2000, // 2秒
  //     retryAttempts: 5,
  //     retryDelay: 500
  //   },

  // API相关数据 - 中等频率
  [API_DURATION_TABLE]: {
    // maxSize: 80
    // flushInterval: 4000 // 4秒
  },

  [API_ERROR_BUSINESS_CODE_TABLE]: {
    // maxSize: 60
    // flushInterval: 4000
  },

  [API_ERROR_HTTP_CODE_TABLE]: {
    // maxSize: 60
    // flushInterval: 4000
  },

  [API_BODY_SIZE_TABLE]: {
    // maxSize: 80
    // flushInterval: 4000
  }
}

/**
 * 获取表的队列配置
 * @param tableName 表名
 * @returns 队列配置
 */
export function getTableQueueConfig(tableName: string): QueueConfig {
  const tableConfig = TABLE_QUEUE_CONFIGS[tableName] || {}
  return { ...DEFAULT_QUEUE_CONFIG, ...tableConfig }
}
