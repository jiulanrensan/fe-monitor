import { API_EVENT_TYPE, MONITOR_TYPE, API_SUB_TYPE } from './monitor'

/**
 * API相关表名常量
 * 这些常量用于构建ClickHouse查询语句
 */

/**
 * API请求耗时表名
 */
export const API_DURATION_TABLE =
  API_EVENT_TYPE[`${MONITOR_TYPE.API}__${API_SUB_TYPE.DURATION}`].toLowerCase()

/**
 * API请求体大小表名
 */
export const API_BODY_SIZE_TABLE =
  API_EVENT_TYPE[`${MONITOR_TYPE.API}__${API_SUB_TYPE.BODY_SIZE}`].toLowerCase()

/**
 * API错误HTTP状态码表名
 */
export const API_ERROR_HTTP_CODE_TABLE =
  API_EVENT_TYPE[`${MONITOR_TYPE.API}__${API_SUB_TYPE.ERROR_HTTP_CODE}`].toLowerCase()

/**
 * API错误业务码表名
 */
export const API_ERROR_BUSINESS_CODE_TABLE =
  API_EVENT_TYPE[`${MONITOR_TYPE.API}__${API_SUB_TYPE.ERROR_BUSINESS_CODE}`].toLowerCase()
