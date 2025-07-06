import { Global, Logger, Module, OnModuleInit } from '@nestjs/common'
import { createClickHouseClient } from './clickhouse.provider'
import { ClickHouseService } from './clickhouse.service'
import { ClickHouseHealthService } from './clickhouse-health.service'

/**
 * ClickHouse 模块
 * 提供全局的 ClickHouse 数据库服务
 */
@Global()
@Module({
  providers: [createClickHouseClient(), ClickHouseService, ClickHouseHealthService],
  exports: [ClickHouseService, ClickHouseHealthService]
})
export class ClickHouseModule implements OnModuleInit {
  private readonly logger = new Logger(ClickHouseModule.name)

  constructor(private readonly healthService: ClickHouseHealthService) {}

  async onModuleInit() {
    this.logger.log('Initializing ClickHouse connection...')

    // 等待连接就绪
    const isConnected = await this.healthService.waitForConnection()

    if (!isConnected) {
      this.logger.error('Critical: ClickHouse connection failed. Application will exit.')
      process.exit(1) // 退出进程，返回错误码1
    }

    this.logger.log('ClickHouse module initialized successfully')
  }
}
