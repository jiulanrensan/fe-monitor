import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common'
import { QueueCacheService, QueueConfig } from './queue-cache.service'

@Controller('queue-cache')
export class QueueCacheController {
  constructor(private readonly queueCacheService: QueueCacheService) {}

  /**
   * 获取所有队列的状态信息
   */
  @Get('status')
  getQueueStatus() {
    return this.queueCacheService.getQueueStatus()
  }

  /**
   * 手动刷新所有队列
   */
  @Post('flush')
  async flushAllQueues() {
    await this.queueCacheService.flushAllQueues()
    return { message: 'All queues flushed successfully' }
  }

  /**
   * 手动刷新指定表的队列
   */
  @Post('flush/:tableName')
  async flushTable(@Param('tableName') tableName: string) {
    await this.queueCacheService.flushTable(tableName)
    return { message: `Queue for table ${tableName} flushed successfully` }
  }

  /**
   * 配置特定表的队列参数
   */
  @Put('configure/:tableName')
  configureTable(@Param('tableName') tableName: string, @Body() config: Partial<QueueConfig>) {
    this.queueCacheService.configureTable(tableName, config)
    return { message: `Queue configured for table ${tableName}` }
  }
}
