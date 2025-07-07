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
import {
  API_DURATION_TABLE,
  API_BODY_SIZE_TABLE,
  API_ERROR_HTTP_CODE_TABLE,
  API_ERROR_BUSINESS_CODE_TABLE
} from '../../../shared/src'

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name)

  constructor(private readonly clickHouseService: ClickHouseService) {}

  /**
   * 上报API耗时数据
   */
  async reportApiDuration(data: ApiDurationReportDto): Promise<void> {
    try {
      const durationData = [
        {
          aid: data.aid,
          sid: data.sid,
          uid: data.uid,
          log_time: data.logTime,
          report_time: data.reportTime,
          retry_times: data.retryTimes,
          model: data.model,
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
      const res = await this.clickHouseService.insert(API_DURATION_TABLE, durationData)
      this.logger.log(`insert success: ${JSON.stringify(res?.summary)}`)
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

      await this.clickHouseService.insert(API_ERROR_BUSINESS_CODE_TABLE, errorData)
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
      const errorData = [
        {
          aid: data.aid,
          url: data.url,
          method: data.method,
          status_code: data.statusCode,
          error_reason: data.error_reason
        }
      ]

      await this.clickHouseService.insert(API_ERROR_HTTP_CODE_TABLE, errorData)
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

      await this.clickHouseService.insert(API_BODY_SIZE_TABLE, bodySizeData)
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
      const performanceData = [
        {
          aid: data.aid,
          duration: data.duration || 0,
          body_size: data.bodySize || 0
        }
      ]

      //   await this.clickHouseService.insert('performance_metrics', performanceData)
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
      const errorData = [
        {
          aid: data.aid,
          error_message: data.errorMessage || '',
          error_code: data.errorCode || '',
          error_stack: data.errorStack || ''
        }
      ]

      await this.clickHouseService.insert('error_logs', errorData)
    } catch (error) {
      this.logger.error(`Failed to report error data: ${error.message}`, error.stack)
      throw error
    }
  }
}
