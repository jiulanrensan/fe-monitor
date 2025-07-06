import { Injectable, Inject, Logger } from '@nestjs/common'
import { ClickHouseClient } from '@clickhouse/client'
import { CLICKHOUSE_CLIENT } from './clickhouse.provider'

@Injectable()
export class ClickHouseHealthService {
  private readonly logger = new Logger(ClickHouseHealthService.name)
  private readonly MAX_RETRIES = 3
  private readonly RETRY_DELAY = 2000 // 2秒

  constructor(
    @Inject(CLICKHOUSE_CLIENT)
    private readonly clickhouse: ClickHouseClient
  ) {}

  /**
   * 检查 ClickHouse 连接状态
   * @param retryCount 重试次数
   * @returns 连接是否正常
   */
  async checkConnection(retryCount = 0): Promise<boolean> {
    try {
      this.logger.log(
        `Checking ClickHouse connection (attempt ${retryCount + 1}/${this.MAX_RETRIES})`
      )

      // 使用更可靠的PING命令检查连接
      const result = await this.clickhouse.ping()

      if (result.success) {
        this.logger.log('ClickHouse connection established successfully')
        return true
      } else {
        throw new Error(`ClickHouse ping failed: ${result.error}`)
      }
    } catch (error) {
      this.logger.error(`ClickHouse connection failed: ${error.message}`)

      if (retryCount < this.MAX_RETRIES - 1) {
        await new Promise((resolve) => setTimeout(resolve, this.RETRY_DELAY))
        return this.checkConnection(retryCount + 1)
      }

      return false
    }
  }

  /**
   * 获取连接健康状态
   * @returns 健康状态对象
   */
  async getHealthStatus(): Promise<{
    status: 'healthy' | 'unhealthy'
    message: string
    timestamp: Date
  }> {
    const isConnected = await this.checkConnection()

    return {
      status: isConnected ? 'healthy' : 'unhealthy',
      message: isConnected ? 'ClickHouse connection is healthy' : 'ClickHouse connection failed',
      timestamp: new Date()
    }
  }

  /**
   * 等待连接就绪
   * @param maxWaitTime 最大等待时间（毫秒）
   * @param checkInterval 检查间隔（毫秒）
   * @returns 是否连接成功
   */
  async waitForConnection(
    maxWaitTime: number = 30000,
    checkInterval: number = 1000
  ): Promise<boolean> {
    const startTime = Date.now()

    while (Date.now() - startTime < maxWaitTime) {
      if (await this.checkConnection()) {
        return true
      }

      await new Promise((resolve) => setTimeout(resolve, checkInterval))
    }

    return false
  }
}
