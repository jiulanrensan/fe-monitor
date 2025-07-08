/**
 * 监控事件常量定义
 * 这些常量被多个微服务共享使用
 */

/**
 * 监控事件大类，后续可以扩展
 * 目前只开发了API类型
 */
export enum MONITOR_TYPE {
  /**
   * API类型: 接口调用相关(包含接口异常、接口耗时)
   */
  API = 'API',
  /**
   * 前端日志类型: 前端日志相关(包含前端日志打印)
   */
  FRE_LOG = 'FRE_LOG',
  /**
   * 错误类型，代码异常
   */
  ERROR = 'ERROR',
  /**
   * 性能类型: 页面性能相关(包含页面加载、页面渲染、页面交互)
   */
  PERFORMANCE = 'PERFORMANCE'
}

export enum API_SUB_TYPE {
  DURATION = 'DURATION',
  BODY_SIZE = 'BODY_SIZE',
  ERROR_HTTP_CODE = 'ERROR_HTTP_CODE',
  ERROR_BUSINESS_CODE = 'ERROR_BUSINESS_CODE'
}

/**
 * API类型事件小类
 * 每个小类对应一张表，表名与小类名一致
 * 如:
 * API__HTTP_STATUS_CODE
 * 对应表名
 * api__http_status_code
 *
 * todo
 * 1. 这些字段应放在数据库中，后续可以扩展
 * 2. 目前这些表都是预先生成的，后续可以扩展为自定义小类名时，自动创建表
 */
export const API_EVENT_TYPE = {
  /**
   * 接口调用http状态码失败
   */
  [`${MONITOR_TYPE.API}__${API_SUB_TYPE.ERROR_HTTP_CODE}`]: `${MONITOR_TYPE.API}__${API_SUB_TYPE.ERROR_HTTP_CODE}`,
  /**
   * 接口调用业务状态码失败
   */
  [`${MONITOR_TYPE.API}__${API_SUB_TYPE.ERROR_BUSINESS_CODE}`]: `${MONITOR_TYPE.API}__${API_SUB_TYPE.ERROR_BUSINESS_CODE}`,
  /**
   * 接口耗时
   */
  [`${MONITOR_TYPE.API}__${API_SUB_TYPE.DURATION}`]: `${MONITOR_TYPE.API}__${API_SUB_TYPE.DURATION}`,
  /**
   * 接口req、res的body体积
   */
  [`${MONITOR_TYPE.API}__${API_SUB_TYPE.BODY_SIZE}`]: `${MONITOR_TYPE.API}__${API_SUB_TYPE.BODY_SIZE}`
} as const

/**
 * API事件类型联合类型
 */
export type ApiEventType = (typeof API_EVENT_TYPE)[keyof typeof API_EVENT_TYPE]
