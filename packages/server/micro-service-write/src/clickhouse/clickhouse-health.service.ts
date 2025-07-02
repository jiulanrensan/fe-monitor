import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClickHouseClient } from '@clickhouse/client';

@Injectable()
export class ClickHouseHealthService {
  private readonly logger = new Logger(ClickHouseHealthService.name);
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 2000; // 2秒

  constructor(
    @Inject('CLICKHOUSE_CLIENT')
    private readonly clickhouse: ClickHouseClient,
  ) {}

  async checkConnection(retryCount = 0): Promise<boolean> {
    try {
      this.logger.log(
        `Checking ClickHouse connection (attempt ${retryCount + 1}/${this.MAX_RETRIES})`,
      );

      // 使用更可靠的PING命令检查连接
      const result = await this.clickhouse.ping();

      if (result.success) {
        this.logger.log('ClickHouse connection established successfully');
        return true;
      } else {
        throw new Error(`ClickHouse ping failed: ${result.error}`);
      }
    } catch (error) {
      this.logger.error(`ClickHouse connection failed: ${error.message}`);

      if (retryCount < this.MAX_RETRIES - 1) {
        await new Promise((resolve) => setTimeout(resolve, this.RETRY_DELAY));
        return this.checkConnection(retryCount + 1);
      }

      return false;
    }
  }
}
