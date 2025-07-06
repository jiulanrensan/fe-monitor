/**
 * 示例：如何扩展新的监控事件
 *
 * 这个文件展示了如何添加新的监控事件到现有的定时任务系统中
 */

import { Injectable, Logger } from '@nestjs/common'
import { EventRegistry } from './event-registry'
import { AlertService } from './alert.service'
import { QueryService } from '../query/query.service'

@Injectable()
export class ExampleExtensionService {
  private readonly logger = new Logger(ExampleExtensionService.name)

  constructor(
    private readonly eventRegistry: EventRegistry,
    private readonly alertService: AlertService,
    private readonly queryService: QueryService
  ) {}

  /**
   * 注册新的监控事件示例
   */
  registerNewEvents(): void {
    // 示例1：监控API调用频率
    this.eventRegistry.registerEvent({
      name: 'api-call-frequency-monitor',
      description: '监控API调用频率异常',
      handler: () => this.monitorApiCallFrequency()
    })

    // 示例2：监控数据库连接数
    this.eventRegistry.registerEvent({
      name: 'database-connection-monitor',
      description: '监控数据库连接数异常',
      handler: () => this.monitorDatabaseConnections()
    })

    // 示例3：监控内存使用率
    this.eventRegistry.registerEvent({
      name: 'memory-usage-monitor',
      description: '监控内存使用率异常',
      handler: () => this.monitorMemoryUsage()
    })
  }

  /**
   * 示例：监控API调用频率
   */
  private async monitorApiCallFrequency(): Promise<void> {
    try {
      const now = new Date()
      const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000)

      const timeRange = {
        start: tenMinutesAgo.toISOString(),
        end: now.toISOString()
      }

      // 这里可以调用自定义的查询方法
      // const result = await this.queryService.customQuery(timeRange);

      // 模拟结果
      const result = [
        { url: '/api/users', count: 1000 },
        { url: '/api/orders', count: 500 }
      ]

      if (this.alertService.shouldAlert(result)) {
        await this.alertService.handleAlert({
          eventName: 'api-call-frequency-monitor',
          data: result,
          timestamp: now.toISOString(),
          description: `发现${result.length}个API接口调用频率异常`
        })
      }
    } catch (error) {
      this.logger.error(`API call frequency monitor failed: ${error.message}`, error.stack)
    }
  }

  /**
   * 示例：监控数据库连接数
   */
  private async monitorDatabaseConnections(): Promise<void> {
    try {
      // 这里可以添加数据库连接数监控逻辑
      const result = [
        { database: 'clickhouse', connections: 50 },
        { database: 'mysql', connections: 30 }
      ]

      if (this.alertService.shouldAlert(result)) {
        await this.alertService.handleAlert({
          eventName: 'database-connection-monitor',
          data: result,
          timestamp: new Date().toISOString(),
          description: `发现${result.length}个数据库连接数异常`
        })
      }
    } catch (error) {
      this.logger.error(`Database connection monitor failed: ${error.message}`, error.stack)
    }
  }

  /**
   * 示例：监控内存使用率
   */
  private async monitorMemoryUsage(): Promise<void> {
    try {
      // 这里可以添加内存使用率监控逻辑
      const memoryUsage = process.memoryUsage()
      const result = [
        {
          type: 'heapUsed',
          value: memoryUsage.heapUsed,
          threshold: 100 * 1024 * 1024 // 100MB
        },
        {
          type: 'heapTotal',
          value: memoryUsage.heapTotal,
          threshold: 200 * 1024 * 1024 // 200MB
        }
      ]

      // 检查是否超过阈值
      const exceeded = result.filter((item) => item.value > item.threshold)

      if (this.alertService.shouldAlert(exceeded)) {
        await this.alertService.handleAlert({
          eventName: 'memory-usage-monitor',
          data: exceeded,
          timestamp: new Date().toISOString(),
          description: `发现${exceeded.length}个内存指标异常`
        })
      }
    } catch (error) {
      this.logger.error(`Memory usage monitor failed: ${error.message}`, error.stack)
    }
  }
}

/**
 * 使用说明：
 *
 * 1. 创建新的监控服务类
 * 2. 实现具体的监控逻辑
 * 3. 在 SchedulerService 中注入该服务
 * 4. 在 registerMonitorEvents() 方法中注册新事件
 * 5. 在 monitor.config.ts 中添加相关配置
 *
 * 示例：
 *
 * // 在 scheduler.service.ts 中
 * constructor(
 *   private readonly exampleExtensionService: ExampleExtensionService,
 * ) {}
 *
 * async onModuleInit() {
 *   this.registerMonitorEvents();
 *   this.exampleExtensionService.registerNewEvents(); // 注册新事件
 * }
 */
