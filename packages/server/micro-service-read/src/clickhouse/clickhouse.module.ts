import { Global, Logger, Module, OnModuleInit } from '@nestjs/common';
import { createClickHouseClient } from './clickhouse.provider';
import { ClickHouseService } from './clickhouse.service';
import { ClickHouseHealthService } from './clickhouse-health.service';

/**
 * 单例模式，全局注入
 */
@Global()
@Module({
  providers: [
    createClickHouseClient(),
    ClickHouseService,
    ClickHouseHealthService,
  ],
  exports: [ClickHouseService, ClickHouseHealthService],
})
export class ClickHouseModule implements OnModuleInit {
  private readonly logger = new Logger(ClickHouseModule.name);

  constructor(private readonly healthService: ClickHouseHealthService) {}

  async onModuleInit() {
    this.logger.log('Initializing ClickHouse connection...');
    const isConnected = await this.healthService.checkConnection();

    if (!isConnected) {
      this.logger.error(
        'Critical: ClickHouse connection failed. Application will exit.',
      );
      process.exit(1); // 退出进程，返回错误码1
    }

    this.logger.log('ClickHouse module initialized');
  }
}
