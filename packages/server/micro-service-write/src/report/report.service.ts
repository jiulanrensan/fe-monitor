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

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name)

  constructor(private readonly clickHouseService: ClickHouseService) {}

  /**
   * 通用的报告方法
   * @param data 原始数据
   * @param dtoClass DTO 类
   * @param tableName 可选的表名，如果不提供则从装饰器获取
   * @param methodName 方法名称，用于日志记录
   */
  private async report<T extends Record<string, any>>(
    data: any,
    dtoClass: new (...args: any[]) => T,
    tableName?: string,
    methodName?: string
  ): Promise<void> {
    const className = dtoClass.name
    const logMethodName = methodName || className

    try {
      const { extractedData, tableName: decoratorTableName } = extractDataFromDto(data, dtoClass)
      const targetTable = tableName || decoratorTableName

      if (!targetTable) {
        throw new Error(`No table mapping found for ${className}`)
      }

      const mappedData = [extractedData]
      const res = await this.clickHouseService.insert(targetTable, mappedData)

      this.logger.log(`Report ${className} success: ${JSON.stringify(res?.summary)}`)
    } catch (error) {
      this.logger.error(`Failed to report ${logMethodName} data: ${error.message}`, error.stack)
      throw error
    }
  }

  /**
   * 上报API耗时数据
   */
  async reportApiDuration(data: any): Promise<void> {
    this.logger.log(`reportApiDuration: ${JSON.stringify(data)}`)
    return this.report(data, ApiDurationReportDto)
  }

  /**
   * 上报API业务错误数据
   */
  async reportApiErrorBusinessCode(data: any): Promise<void> {
    return this.report(data, ApiErrorBusinessCodeReportDto)
  }

  /**
   * 上报API HTTP错误数据
   */
  async reportApiErrorHttpCode(data: any): Promise<void> {
    return this.report(data, ApiErrorHttpCodeReportDto)
  }

  /**
   * 上报API Body大小数据
   */
  async reportApiBodySize(data: any): Promise<void> {
    return this.report(data, ApiBodySizeReportDto)
  }

  /**
   * 上报性能监控数据
   */
  async reportPerformance(data: any): Promise<void> {
    return this.report(data, PerformanceDto, 'performance_metrics', 'PerformanceDto')
  }

  /**
   * 上报错误监控数据
   */
  async reportError(data: any): Promise<void> {
    return this.report(data, ErrorDto, 'error_logs', 'ErrorDto')
  }
}
