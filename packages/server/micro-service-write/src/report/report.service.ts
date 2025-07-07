import { Injectable, Logger } from '@nestjs/common'
import { ClickHouseService } from '../../../shared/src'
import {
  PerformanceDto,
  ErrorDto,
  APIDto,
  ApiDurationReportDto,
  ApiErrorBusinessCodeReportDto,
  ApiErrorHttpCodeReportDto,
  ApiBodySizeReportDto
} from './dto'

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
   * 上报API耗时数据
   */
  async reportApiDuration(data: ApiDurationReportDto): Promise<void> {
    try {
      const durationData = [
        {
          aid: data.aid,
          url: data.url,
          method: data.method,
          status_code: data.statusCode,
          duration: data.duration,
          queue_time: data.queueTime || 0,
          queue_start: data.queueStart || 0,
          queue_end: data.queueEnd || 0,
          req_page: data.reqPage,
          res_page: data.resPage,
          network: data.network
        }
      ]

      await this.clickHouseService.insert('api_duration_metrics', durationData)
      this.logger.log(`API duration data reported successfully for app: ${data.aid}`)
    } catch (error) {
      this.logger.error(`Failed to report API duration data: ${error.message}`, error.stack)
      throw error
    }
  }

  /**
   * 上报API业务错误数据
   */
  async reportApiErrorBusinessCode(data: ApiErrorBusinessCodeReportDto): Promise<void> {
    try {
      this.logger.log(`Reporting API business error data for app: ${data.aid}`)

      const errorData = [
        {
          aid: data.aid,
          url: data.url,
          method: data.method,
          status_code: data.statusCode,
          error_code: data.errorCode,
          error_reason: data.errorReason
        }
      ]

      await this.clickHouseService.insert('api_business_errors', errorData)
      this.logger.log(`API business error data reported successfully for app: ${data.aid}`)
    } catch (error) {
      this.logger.error(`Failed to report API business error data: ${error.message}`, error.stack)
      throw error
    }
  }

  /**
   * 上报API HTTP错误数据
   */
  async reportApiErrorHttpCode(data: ApiErrorHttpCodeReportDto): Promise<void> {
    try {
      this.logger.log(`Reporting API HTTP error data for app: ${data.aid}`)

      const errorData = [
        {
          aid: data.aid,
          url: data.url,
          method: data.method,
          status_code: data.statusCode,
          error_reason: data.error_reason
        }
      ]

      await this.clickHouseService.insert('api_http_errors', errorData)
      this.logger.log(`API HTTP error data reported successfully for app: ${data.aid}`)
    } catch (error) {
      this.logger.error(`Failed to report API HTTP error data: ${error.message}`, error.stack)
      throw error
    }
  }

  /**
   * 上报API Body大小数据
   */
  async reportApiBodySize(data: ApiBodySizeReportDto): Promise<void> {
    try {
      this.logger.log(`Reporting API body size data for app: ${data.aid}`)

      const bodySizeData = [
        {
          aid: data.aid,
          url: data.url,
          method: data.method,
          status_code: data.statusCode,
          req_body_size: data.reqBodySize,
          res_body_size: data.resBodySize
        }
      ]

      await this.clickHouseService.insert('api_body_size_metrics', bodySizeData)
      this.logger.log(`API body size data reported successfully for app: ${data.aid}`)
    } catch (error) {
      this.logger.error(`Failed to report API body size data: ${error.message}`, error.stack)
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
