/**
 * todo 后续将常量放在 packages/shared 中
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
 * 回调类型常量
 * 用于控制插件数据如何处理
 */
export enum CALLBACK_TYPE {
  /**
   * 缓存行为：加入缓存队列
   */
  CACHE = 'CACHE',
  /**
   * 刷新行为：清空队列，发送数据
   */
  FLUSH = 'FLUSH',
  /**
   * 立即上报行为：立即上报数据
   */
  DIRECT_SEND = 'DIRECT_SEND'
}
