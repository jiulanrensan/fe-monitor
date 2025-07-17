export interface MonitorConfig {
  // 通用配置
  pid: string
  dingTalkWebhookUrl: string
  // 定时任务配置
  scheduler: {
    cronExpression: string // cron表达式
    timeRangeMinutes: number // 监控时间范围（分钟）
  }

  // API耗时监控配置
  apiDuration: {
    duration: number // 耗时阈值（毫秒）
    threshold: number // 触发告警的最小次数
  }

  // API请求体大小监控配置
  apiBodySize: {
    reqBodySize: number // 请求体大小阈值（字节）
    resBodySize: number // 响应体大小阈值（字节）
    threshold: number
  }

  // API错误HTTP状态码监控配置
  apiErrorHttpCode: {
    statusCode: number // 监控的状态码
    useGreaterEqual: boolean // 是否监控大于等于该状态码
    threshold: number
  }

  // API错误业务码监控配置
  apiErrorBusinessCode: {
    errorCodes: number[] // 需要监控的业务错误码
    threshold: number
  }
}

/**
 * todo 抽离到配置文件中
 */
export const defaultMonitorConfig: MonitorConfig = {
  pid: 'jz_miniapp',
  dingTalkWebhookUrl: '',
  // 定时任务配置
  scheduler: {
    cronExpression: '0 */5 * * * *', // 每10分钟执行一次
    timeRangeMinutes: 5 // 监控最近10分钟的数据
  },

  apiDuration: {
    duration: 200, // 200ms
    threshold: 10
  },

  apiBodySize: {
    reqBodySize: 200, // 0kb
    resBodySize: 200, // 200kb
    threshold: 10
  },

  apiErrorHttpCode: {
    statusCode: 400,
    useGreaterEqual: true,
    threshold: 10
  },

  apiErrorBusinessCode: {
    errorCodes: [500],
    threshold: 10
  }
}
