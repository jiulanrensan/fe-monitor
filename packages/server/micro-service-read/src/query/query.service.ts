import { Injectable, Logger } from '@nestjs/common';
import { ClickHouseService } from '../clickhouse/clickhouse.service';
import { QueryOptions } from './dto';
import { API_EVENT_TYPE, MONITOR_TYPE } from 'src/const/monitor';

const API_DURATION_TABLE =
  API_EVENT_TYPE[`${MONITOR_TYPE.API}__DURATION`].toLowerCase();

export interface QueryResult<T = any> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

@Injectable()
export class QueryService {
  private readonly logger = new Logger(QueryService.name);

  constructor(private readonly clickHouseService: ClickHouseService) {}

  /**
   * 查询表结构
   */
  async getTableSchema(tableName: string): Promise<any[]> {
    const query = `DESCRIBE TABLE ${tableName}`;
    this.logger.log(`Getting schema for table: ${tableName}`);
    return this.clickHouseService.query(query);
  }

  /**
   * 查询表列表
   */
  async getTables(): Promise<any[]> {
    const query = `SHOW TABLES`;
    this.logger.log('Getting table list');
    return this.clickHouseService.query(query);
  }

  /**
   * 查询数据库列表
   */
  async getDatabases(): Promise<any[]> {
    const query = `SHOW DATABASES`;
    this.logger.log('Getting database list');
    return this.clickHouseService.query(query);
  }

  /**
   * 执行自定义查询
   */
  async executeQuery<T = any>(query: string): Promise<T[]> {
    this.logger.log(`Executing query: ${query}`);
    return this.clickHouseService.query<T>(query);
  }

  /**
   * 执行聚合查询
   */
  async executeAggregation<T = any>(
    tableName: string,
    aggregation: string,
    groupBy?: string,
    where?: string,
  ): Promise<T[]> {
    let query = `SELECT ${aggregation} FROM ${tableName}`;

    if (where) {
      query += ` WHERE ${where}`;
    }

    if (groupBy) {
      query += ` GROUP BY ${groupBy}`;
    }

    this.logger.log(`Executing aggregation query: ${query}`);
    return this.clickHouseService.query<T>(query);
  }

  /**
   * 查询api请求总耗时数据条数
   */
  async apiDurationCount(
    timeRange: { start: string; end: string },
    duration: number,
    aid: string,
  ): Promise<number> {
    // 构建查询条件
    const conditions = [
      `report_time >= '${timeRange.start}'`,
      `report_time <= '${timeRange.end}'`,
      `duration >= ${duration}`,
      `aid = '${aid}'`,
    ];

    const whereClause = conditions.join(' AND ');
    const query = `SELECT COUNT(*) as count FROM ${API_DURATION_TABLE} WHERE ${whereClause}`;

    this.logger.log(`Executing count query: ${query}`);

    const result = await this.clickHouseService.query<{ count: number }>(query);
    this.logger.log(`Query result: ${JSON.stringify(result)}`);
    return result[0]?.count || 0;
  }
}
