/**
 * 查询相关的 DTO 定义
 */

// 导出基础 DTO 类
export { TimeRangeDto, APIDto } from './base.dto'

// 导出所有业务查询 DTO 类
export { ApiDurationQueryDto } from './api-duration.dto'
export { ApiBodySizeQueryDto } from './api-body-size.dto'
export { ApiErrorHttpCodeQueryDto } from './api-error-http-code.dto'
export { ApiErrorBusinessCodeQueryDto } from './api-error-business-code.dto'
export { ExecuteQueryDto } from './execute-query.dto'
export { AggregationQueryDto } from './aggregation-query.dto'

// 导出所有响应 DTO 类
export { ApiDurationResponseDto } from './api-duration.dto'
export { ApiBodySizeResponseDto } from './api-body-size.dto'
export { ApiErrorHttpCodeResponseDto } from './api-error-http-code.dto'
export { ApiErrorBusinessCodeResponseDto } from './api-error-business-code.dto'

export interface QueryOptions {
  limit?: number
  offset?: number
  orderBy?: string
  orderDirection?: 'ASC' | 'DESC'
}
