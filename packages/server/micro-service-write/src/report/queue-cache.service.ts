import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common'
import { ClickHouseService } from '../../../shared/src'
import { DEFAULT_QUEUE_CONFIG, getTableQueueConfig } from './queue.config'

export interface QueueConfig {
  maxSize: number // 队列最大长度
  flushInterval: number // 刷新间隔（毫秒）
  retryAttempts?: number // 重试次数
  retryDelay?: number // 重试延迟（毫秒）
}

export interface QueueItem<T = any> {
  data: T
  timestamp: number
}

@Injectable()
export class QueueCacheService implements OnModuleDestroy {
  private readonly logger = new Logger(QueueCacheService.name)
  private readonly queues = new Map<string, QueueItem[]>()
  private readonly timers = new Map<string, NodeJS.Timeout>()
  private readonly tableConfigs = new Map<string, QueueConfig>()
  private readonly defaultConfig: QueueConfig = DEFAULT_QUEUE_CONFIG
  private isManualFlush = false

  constructor(private readonly clickHouseService: ClickHouseService) {}

  /**
   * 将数据推入指定表的队列
   * @param tableName 表名
   * @param data 数据
   * @param config 队列配置（可选）
   */
  async push<T = any>(tableName: string, data: T, config?: Partial<QueueConfig>): Promise<void> {
    // 获取或创建表配置
    if (!this.tableConfigs.has(tableName)) {
      const tableConfig = getTableQueueConfig(tableName)
      this.tableConfigs.set(tableName, { ...tableConfig, ...config })
    } else if (config) {
      // 更新现有配置
      const existingConfig = this.tableConfigs.get(tableName)!
      this.tableConfigs.set(tableName, { ...existingConfig, ...config })
    }

    const queueConfig = this.tableConfigs.get(tableName)!

    // 获取或创建队列
    if (!this.queues.has(tableName)) {
      this.queues.set(tableName, [])
      this.startTimer(tableName, queueConfig.flushInterval)
    }

    const queue = this.queues.get(tableName)!
    const queueItem: QueueItem<T> = {
      data,
      timestamp: Date.now()
    }

    queue.push(queueItem)

    // 检查队列长度是否达到阈值
    if (queue.length >= queueConfig.maxSize) {
      this.logger.log(`Queue for table ${tableName} is full, flushing...`)
      await this.flushQueue(tableName)
    }
  }

  /**
   * 刷新指定表的队列
   * @param tableName 表名
   */
  private async flushQueue(tableName: string): Promise<void> {
    const queue = this.queues.get(tableName)
    const queueConfig = this.tableConfigs.get(tableName) || this.defaultConfig

    if (!queue || queue.length === 0) {
      this.logger.log(`Queue for table ${tableName} is empty, skipping flush`)
      return
    }

    // 如果是定时器触发的刷新，且队列长度小于阈值的一半，则跳过
    const isTimerTriggered = !this.isManualFlush
    if (isTimerTriggered && queue.length < queueConfig.maxSize / 2) {
      this.logger.log(
        `Queue for table ${tableName} is too small (${queue.length}/${queueConfig.maxSize}), skipping timer flush`
      )
      return
    }

    const dataToInsert = queue.map((item) => item.data)
    let retryCount = 0

    while (retryCount <= queueConfig.retryAttempts!) {
      try {
        // 清空队列（在插入前清空，避免重复插入）
        queue.length = 0

        // 批量插入数据
        // 插入失败返回 null
        const result = await this.clickHouseService.insert(tableName, dataToInsert)

        this.logger.log(
          `Flushed ${dataToInsert.length} items to table ${tableName}: ${JSON.stringify(result?.summary)}`
        )
        if (result) return // 成功插入，退出重试循环
        retryCount++
        this.logger.error(
          `Failed to insert data to table ${tableName}(attempt ${retryCount}/${queueConfig.retryAttempts! + 1})`
        )

        if (retryCount <= queueConfig.retryAttempts!) {
          // 等待重试延迟
          await new Promise((resolve) => setTimeout(resolve, queueConfig.retryDelay!))
        } else {
          // 重试次数用完，不放回队列，避免内存泄露
          this.logger.error(
            `Max retry attempts reached for table ${tableName}, restoring ${dataToInsert.length} items to queue`
          )
          //   queue.push(...dataToInsert.map((data) => ({ data, timestamp: Date.now() })))
        }
      } catch (error) {
        this.logger.error(
          `Failed to flush queue for table ${tableName} (attempt ${retryCount}/${queueConfig.retryAttempts! + 1}): ${error.message}`,
          error.stack
        )
      }
    }
  }

  /**
   * 启动定时器
   * @param tableName 表名
   * @param interval 间隔时间
   */
  private startTimer(tableName: string, interval: number): void {
    // 清除已存在的定时器
    if (this.timers.has(tableName)) {
      clearTimeout(this.timers.get(tableName)!)
    }

    // 创建新的定时器
    const timer = setTimeout(async () => {
      this.logger.log(`Queue for table ${tableName} is timer triggered, flushing...`)
      await this.flushQueue(tableName)
      // 重新启动定时器
      this.startTimer(tableName, interval)
    }, interval)

    this.timers.set(tableName, timer)
  }

  /**
   * 手动刷新所有队列
   */
  async flushAllQueues(): Promise<void> {
    this.isManualFlush = true
    try {
      const tableNames = Array.from(this.queues.keys())
      const promises = tableNames.map((tableName) => this.flushQueue(tableName))
      await Promise.all(promises)
    } finally {
      this.isManualFlush = false
    }
  }

  /**
   * 手动刷新指定表的队列
   * @param tableName 表名
   */
  async flushTable(tableName: string): Promise<void> {
    this.isManualFlush = true
    try {
      await this.flushQueue(tableName)
    } finally {
      this.isManualFlush = false
    }
  }

  /**
   * 配置特定表的队列参数
   * @param tableName 表名
   * @param config 配置参数
   */
  configureTable(tableName: string, config: Partial<QueueConfig>): void {
    const existingConfig = this.tableConfigs.get(tableName) || this.defaultConfig
    this.tableConfigs.set(tableName, { ...existingConfig, ...config })

    // 如果队列已存在，更新定时器间隔
    if (this.queues.has(tableName) && config.flushInterval) {
      this.startTimer(tableName, config.flushInterval)
    }

    this.logger.log(`Configured queue for table ${tableName}: ${JSON.stringify(config)}`)
  }

  /**
   * 获取队列状态信息
   */
  getQueueStatus(): Record<string, { size: number; config: QueueConfig }> {
    const status: Record<string, { size: number; config: QueueConfig }> = {}

    for (const [tableName, queue] of this.queues.entries()) {
      status[tableName] = {
        size: queue.length,
        config: this.tableConfigs.get(tableName) || this.defaultConfig
      }
    }

    return status
  }

  /**
   * 模块销毁时清理资源
   */
  async onModuleDestroy(): Promise<void> {
    // 刷新所有队列
    await this.flushAllQueues()

    // 清除所有定时器
    for (const timer of this.timers.values()) {
      clearTimeout(timer)
    }

    this.timers.clear()
    this.queues.clear()

    this.logger.log('QueueCacheService destroyed, all queues flushed')
  }
}
