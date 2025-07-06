import { Injectable, Logger } from '@nestjs/common'
import { ClickHouseService } from '../../../shared/src'
import { PerformanceDto, ErrorDto, APIDto } from './dto'

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name)

  constructor(private readonly clickHouseService: ClickHouseService) {}

  /**
   * 上报API监控数据
   */
  async reportApi(data: APIDto): Promise<void> {
    try {
      this.logger.log(`Reporting API data for app: ${data.aid}`)
    } catch (error) {
      this.logger.error(`Failed to report API data: ${error.message}`, error.stack)
      throw error
    }
  }

  /**
   * 上报性能监控数据
   */
  async reportPerformance(data: PerformanceDto): Promise<void> {
    try {
      this.logger.log(`Reporting performance data for app: ${data.aid}`)

      const performanceData = [
        {
          aid: data.aid,
          duration: data.duration || 0,
          body_size: data.bodySize || 0
        }
      ]

      //   await this.clickHouseService.insert('performance_metrics', performanceData)
      this.logger.log(`Performance data reported successfully for app: ${data.aid}`)
    } catch (error) {
      this.logger.error(`Failed to report performance data: ${error.message}`, error.stack)
      throw error
    }
  }

  /**
   * 上报错误监控数据
   */
  async reportError(data: ErrorDto): Promise<void> {
    try {
      this.logger.log(`Reporting error data for app: ${data.aid}`)

      const errorData = [
        {
          aid: data.aid,
          error_message: data.errorMessage || '',
          error_code: data.errorCode || '',
          error_stack: data.errorStack || ''
        }
      ]

      await this.clickHouseService.insert('error_logs', errorData)
      this.logger.log(`Error data reported successfully for app: ${data.aid}`)
    } catch (error) {
      this.logger.error(`Failed to report error data: ${error.message}`, error.stack)
      throw error
    }
  }
}
