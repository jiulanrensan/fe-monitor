import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClickHouseClient, InsertResult } from '@clickhouse/client';
import { CLICKHOUSE_CLIENT } from './clickhouse.provider';

/**
 * 封装clickhouse的增删改查
 */
@Injectable()
export class ClickHouseService {
  private readonly logger = new Logger(ClickHouseService.name);

  constructor(
    @Inject(CLICKHOUSE_CLIENT) private readonly client: ClickHouseClient,
  ) {}

  async query<T = any>(query: string): Promise<T[]> {
    try {
      const result = await this.client.query({
        query,
        format: 'JSONEachRow',
      });
      return result.json<T>();
    } catch (error) {
      this.logger.error(
        `ClickHouse query failed: ${error.message}`,
        error.stack,
      );
      return [];
    }
  }

  async insert(table: string, data: any[]): Promise<InsertResult | null> {
    try {
      return this.client.insert({
        table,
        values: data,
        format: 'JSONEachRow',
      });
    } catch (error) {
      this.logger.error(
        `ClickHouse insert failed: ${error.message}`,
        error.stack,
      );
      return null;
    }
  }
}
