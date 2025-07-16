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
import { extractDataFromDto } from 'shared/src'
import { QueueCacheService } from './queue-cache.service'
import { FreLogReportDto } from './dto/fre-log.dto'

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name)

  constructor(
    private readonly clickHouseService: ClickHouseService,
    private readonly queueCacheService: QueueCacheService
  ) {}

  /**
   * 通用的报告方法
   * @param data 原始数据
   * @param dtoClass DTO 类
   * @param tableName 可选的表名，如果不提供则从装饰器获取
   * @param methodName 方法名称，用于日志记录
   */
  private report<T extends Record<string, any>>(
    data: any,
    dtoClass: new (...args: any[]) => T,
    tableName?: string,
    methodName?: string
  ) {
    const className = dtoClass.name
    const logMethodName = methodName || className

    try {
      const { extractedData, tableName: decoratorTableName } = extractDataFromDto(data, dtoClass)
      const targetTable = tableName || decoratorTableName

      if (!targetTable) {
        throw new Error(`No table mapping found for ${className}`)
      }

      // 将数据推入缓存队列，而不是直接插入数据库
      //   异步操作，不阻塞主线程
      this.queueCacheService.push(targetTable, extractedData)
    } catch (error) {
      this.logger.error(`Failed to queue ${logMethodName} data: ${error.message}`, error.stack)
      throw error
    }
  }

  /**
   * 上报API耗时数据
   */
  reportApiDuration(data: any): void {
    // this.logger.log(`reportApiDuration: ${JSON.stringify(data)}`)
    return this.report(data, ApiDurationReportDto)
  }

  /**
   * 上报API业务错误数据
   */
  reportApiErrorBusinessCode(data: any): void {
    return this.report(data, ApiErrorBusinessCodeReportDto)
  }

  /**
   * 上报API HTTP错误数据
   */
  reportApiErrorHttpCode(data: any): void {
    return this.report(data, ApiErrorHttpCodeReportDto)
  }

  /**
   * 上报API Body大小数据
   */
  reportApiBodySize(data: any): void {
    return this.report(data, ApiBodySizeReportDto)
  }

  /**
   * todo 待开发
   * 上报性能监控数据
   */
  reportPerformance(data: any): void {
    return this.report(data, PerformanceDto, 'performance_metrics', 'PerformanceDto')
  }

  /**
   * todo 待开发
   * 上报错误监控数据
   */
  reportError(data: any): void {
    return this.report(data, ErrorDto, 'error_logs', 'ErrorDto')
  }

  reportFreLog(data: any): void {
    return this.report(data, FreLogReportDto)
  }
}
