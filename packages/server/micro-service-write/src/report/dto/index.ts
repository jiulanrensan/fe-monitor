/**
 * 上报相关的 DTO 定义
 */

// 导出基础 DTO 类
export { APIDto, PerformanceDto, ErrorDto } from './base.dto'

// 导出 API 子类型 DTO
export { ApiDurationReportDto } from './api-duration.dto'
export { ApiErrorBusinessCodeReportDto } from './api-error-business-code.dto'
export { ApiErrorHttpCodeReportDto } from './api-error-http-code.dto'
export { ApiBodySizeReportDto } from './api-body-size.dto'
