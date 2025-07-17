import { Injectable, Logger } from '@nestjs/common'
import { ClickHouseService } from '../../../shared/src'
import {
  ApiDurationResponseDto,
  ApiBodySizeResponseDto,
  ApiErrorHttpCodeResponseDto,
  ApiErrorBusinessCodeResponseDto
} from './dto'
import {
  API_DURATION_TABLE,
  API_BODY_SIZE_TABLE,
  API_ERROR_HTTP_CODE_TABLE,
  API_ERROR_BUSINESS_CODE_TABLE
} from '../../../shared/src'

@Injectable()
export class QueryService {
  private readonly logger = new Logger(QueryService.name)

  constructor(private readonly clickHouseService: ClickHouseService) {}

  /**
   * 查询表结构
   */
  async getTableSchema(tableName: string): Promise<{ data: any[]; stats: any }> {
    const query = `DESCRIBE TABLE ${tableName}`
    this.logger.log(`Getting schema for table: ${tableName}`)
    return this.clickHouseService.query(query)
  }

  /**
   * 查询表列表
   */
  async getTables(): Promise<{ data: any[]; stats: any }> {
    const query = `SHOW TABLES`
    this.logger.log('Getting table list')
    return this.clickHouseService.query(query)
  }

  /**
   * 查询数据库列表
   */
  async getDatabases(): Promise<{ data: any[]; stats: any }> {
    const query = `SHOW DATABASES`
    this.logger.log('Getting database list')
    return this.clickHouseService.query(query)
  }

  /**
   * 执行自定义查询
   */
  async executeQuery<T = any>(query: string): Promise<{ data: T[]; stats: any }> {
    this.logger.log(`Executing query: ${query}`)
    return this.clickHouseService.query<T>(query)
  }

  /**
   * 执行聚合查询
   */
  async executeAggregation<T = any>(
    tableName: string,
    aggregation: string,
    groupBy?: string,
    where?: string
  ): Promise<{ data: T[]; stats: any }> {
    let query = `SELECT ${aggregation} FROM ${tableName}`

    if (where) {
      query += ` WHERE ${where}`
    }

    if (groupBy) {
      query += ` GROUP BY ${groupBy}`
    }

    this.logger.log(`Executing aggregation query: ${query}`)
    return this.clickHouseService.query<T>(query)
  }

  /**
   * 查询api请求总耗时数据条数
   */
  async apiDurationCount(
    timeRange: { start: string; end: string },
    duration: number,
    pid: string,
    threshold: number
  ): Promise<{ data: ApiDurationResponseDto[]; stats: any }> {
    // 构建查询条件
    const conditions = [
      `report_time >= '${timeRange.start}'`,
      `report_time <= '${timeRange.end}'`,
      `duration >= ${duration}`,
      `pid = '${pid}'`
    ]

    const whereClause = conditions.join(' AND ')
    const query = `
      SELECT url, count() AS count,
      quantileTDigest(0.50)(duration) AS median,
      quantileTDigest(0.95)(duration) AS p95,
      quantileTDigest(0.99)(duration) AS p99
      FROM ${API_DURATION_TABLE} WHERE ${whereClause} GROUP BY url HAVING count >= ${threshold}`

    this.logger.log(`Executing count query: ${query}`)

    const result = await this.clickHouseService.query<ApiDurationResponseDto>(query)
    this.logger.log(`apiDurationCount Query result: ${JSON.stringify(result)}`)
    return result
  }

  /**
   * 查询body大小数据条数
   */
  async apiBodySizeCount(
    timeRange: { start: string; end: string },
    pid: string,
    reqBodySize: number,
    resBodySize: number,
    threshold: number
  ): Promise<{ data: ApiBodySizeResponseDto[]; stats: any }> {
    // 构建查询条件
    const conditions = [
      `report_time >= '${timeRange.start}'`,
      `report_time <= '${timeRange.end}'`,
      `pid = '${pid}'`,
      `(req_body_size >= ${reqBodySize} OR res_body_size >= ${resBodySize})`
    ]

    const whereClause = conditions.join(' AND ')
    const query = `SELECT url, count() AS count,
    quantileTDigest(0.50)(req_body_size) AS median_req_body_size,
    quantileTDigest(0.50)(res_body_size) AS median_res_body_size
    FROM ${API_BODY_SIZE_TABLE} WHERE ${whereClause} GROUP BY url HAVING count >= ${threshold}`

    this.logger.log(`Executing body size count query: ${query}`)

    const result = await this.clickHouseService.query<ApiBodySizeResponseDto>(query)
    this.logger.log(`apiBodySizeCount Query result: ${JSON.stringify(result)}`)
    return result
  }

  /**
   * 查询错误http状态码数据条数
   */
  async apiErrorHttpCodeCount(
    timeRange: { start: string; end: string },
    pid: string,
    statusCode: number,
    useGreaterEqual: boolean = true,
    threshold: number
  ): Promise<{ data: ApiErrorHttpCodeResponseDto[]; stats: any }> {
    // 构建查询条件
    const conditions = [
      `report_time >= '${timeRange.start}'`,
      `report_time <= '${timeRange.end}'`,
      `pid = '${pid}'`,
      useGreaterEqual ? `status_code >= ${statusCode}` : `status_code = ${statusCode}`
    ]

    const whereClause = conditions.join(' AND ')
    const query = `SELECT url, status_code, count() AS count FROM ${API_ERROR_HTTP_CODE_TABLE} WHERE ${whereClause} GROUP BY url, status_code HAVING count >= ${threshold}`

    this.logger.log(`Executing error http code count query: ${query}`)

    const result = await this.clickHouseService.query<ApiErrorHttpCodeResponseDto>(query)
    this.logger.log(`apiErrorHttpCodeCount Query result: ${JSON.stringify(result)}`)
    return result
  }

  /**
   * 查询错误业务码数据条数
   */
  async apiErrorBusinessCodeCount(
    timeRange: { start: string; end: string },
    pid: string,
    errorCodes: number[],
    threshold: number
  ): Promise<{ data: ApiErrorBusinessCodeResponseDto[]; stats: any }> {
    // 构建查询条件
    const conditions = [
      `report_time >= '${timeRange.start}'`,
      `report_time <= '${timeRange.end}'`,
      `pid = '${pid}'`
    ]

    // 如果提供了错误码数组，添加错误码条件
    if (errorCodes && errorCodes.length > 0) {
      const errorCodeList = errorCodes.map((code) => `${code}`).join(',')
      conditions.push(`error_code IN (${errorCodeList})`)
    }

    const whereClause = conditions.join(' AND ')
    const query = `SELECT url, error_code, count() AS count FROM ${API_ERROR_BUSINESS_CODE_TABLE} WHERE ${whereClause} GROUP BY url, error_code HAVING count >= ${threshold}`

    this.logger.log(`Executing error business code count query: ${query}`)

    const result = await this.clickHouseService.query<ApiErrorBusinessCodeResponseDto>(query)
    this.logger.log(`apiErrorBusinessCodeCount Query result: ${JSON.stringify(result)}`)
    return result
  }
}
