import { Inject, Injectable, Logger } from '@nestjs/common'
import { ClickHouseClient, InsertResult } from '@clickhouse/client'
import { CLICKHOUSE_CLIENT } from './clickhouse.provider'

/**
 * 封装clickhouse的增删改查
 */
@Injectable()
export class ClickHouseService {
  private readonly logger = new Logger(ClickHouseService.name)

  constructor(@Inject(CLICKHOUSE_CLIENT) private readonly client: ClickHouseClient) {}

  async query<T = any>(query: string): Promise<{ data: T[]; stats: any }> {
    try {
      const result = await this.client.query({
        query,
        format: 'JSONEachRow'
      })
      this.logger.log(`ClickHouse query result: ${JSON.stringify(result.response_headers)}`)
      const responseHeaders = result.response_headers
      const summaryHeader = responseHeaders['x-clickhouse-summary']
      const summary = JSON.parse(
        Array.isArray(summaryHeader) ? summaryHeader[0] || '{}' : summaryHeader || '{}'
      ) as {
        read_rows?: string
        read_bytes?: string
        total_rows_to_read?: string
        elapsed_ns?: string
      }
      const data = await result.json<T>()
      return {
        data,
        stats: summary
      }
    } catch (error) {
      this.logger.error(`ClickHouse query failed: ${error.message}`, error.stack)
      return {
        data: [],
        stats: {}
      }
    }
  }

  async insert(table: string, data: any[]): Promise<InsertResult | null> {
    try {
      return await this.client.insert({
        table,
        values: data,
        format: 'JSONEachRow'
      })
    } catch (error) {
      this.logger.error(`ClickHouse insert failed: ${error.message}`, error.stack)
      return null
    }
  }
}
