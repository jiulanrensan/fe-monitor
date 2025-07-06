import { Injectable, Logger } from '@nestjs/common'
import { ClickHouseService } from '../../shared/src'

/**
 * 数据服务示例
 * 展示如何在 micro-service-write 中使用共享的 ClickHouse 服务
 */
@Injectable()
export class DataService {
  private readonly logger = new Logger(DataService.name)

  constructor(private readonly clickHouseService: ClickHouseService) {}

  /**
   * 插入监控数据
   * @param data 监控数据
   * @returns 插入结果
   */
  async insertMonitorData(data: any[]): Promise<any> {
    try {
      this.logger.log(`Inserting ${data.length} monitor records`)

      // 使用批量插入以提高性能
      const result = await this.clickHouseService.insert('monitor_events', data)

      this.logger.log(`Successfully inserted ${data.length} monitor records`)
      return result
    } catch (error) {
      this.logger.error(`Failed to insert monitor data: ${error.message}`)
      throw error
    }
  }

  /**
   * 插入错误日志
   * @param errorData 错误数据
   * @returns 插入结果
   */
  async insertErrorLog(errorData: any[]): Promise<any> {
    try {
      this.logger.log(`Inserting ${errorData.length} error logs`)

      const result = await this.clickHouseService.insert('error_logs', errorData)

      this.logger.log(`Successfully inserted ${errorData.length} error logs`)
      return result
    } catch (error) {
      this.logger.error(`Failed to insert error logs: ${error.message}`)
      throw error
    }
  }

  /**
   * 获取数据统计信息
   * @param table 表名
   * @returns 统计信息
   */
  async getTableStats(table: string): Promise<any> {
    try {
      const query = `SELECT count() as total_count FROM ${table}`
      const result = await this.clickHouseService.query(query)
      return result[0]
    } catch (error) {
      this.logger.error(`Failed to get table stats: ${error.message}`)
      throw error
    }
  }
}
