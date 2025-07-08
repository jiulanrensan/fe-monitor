import { Injectable, Logger, OnModuleDestroy, Inject } from '@nestjs/common'
import { ClickHouseClient } from '@clickhouse/client'
import { CLICKHOUSE_CLIENT } from './clickhouse.provider'

/**
 * ClickHouse 连接管理服务
 * 负责在应用关闭时优雅地断开数据库连接
 */
@Injectable()
export class ClickHouseConnectionManagerService implements OnModuleDestroy {
  private readonly logger = new Logger(ClickHouseConnectionManagerService.name)

  constructor(@Inject(CLICKHOUSE_CLIENT) private readonly clickhouseClient: ClickHouseClient) {}

  /**
   * 在模块销毁时断开数据库连接
   */
  async onModuleDestroy() {
    this.logger.log('Disconnecting from ClickHouse...')

    try {
      // 关闭 ClickHouse 客户端连接
      await this.clickhouseClient.close()
      this.logger.log('ClickHouse connection closed successfully')
    } catch (error) {
      this.logger.error('Error closing ClickHouse connection:', error)
    }
  }

  /**
   * 手动断开数据库连接
   * 可以在需要时手动调用
   */
  async disconnect(): Promise<void> {
    this.logger.log('Manually disconnecting from ClickHouse...')

    try {
      await this.clickhouseClient.close()
      this.logger.log('ClickHouse connection manually closed successfully')
    } catch (error) {
      this.logger.error('Error manually closing ClickHouse connection:', error)
      throw error
    }
  }

  /**
   * 检查连接状态
   */
  async isConnected(): Promise<boolean> {
    try {
      // 尝试执行一个简单的查询来检查连接状态
      await this.clickhouseClient.query({
        query: 'SELECT 1'
      })
      return true
    } catch (error) {
      this.logger.warn('ClickHouse connection check failed:', error)
      return false
    }
  }
}
