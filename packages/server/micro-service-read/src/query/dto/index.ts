/**
 * 查询相关的 DTO 定义
 */

// 导出基础 DTO 类
export { TimeRangeDto, APIDto } from './base.dto';

// 导出所有业务 DTO 类
export { ApiDurationQueryDto } from './api-duration.dto';
export { ApiBodySizeQueryDto } from './api-body-size.dto';
export { ExecuteQueryDto } from './execute-query.dto';
export { AggregationQueryDto } from './aggregation-query.dto';

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
}
