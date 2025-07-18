import { BasePluginType, NotifyFunc } from '@/core/type'
import { ApiReport, PluginOption } from '../type'
import { MONITOR_TYPE, API_SUB_TYPE } from '@/core/constant'

export type RequestPluginOption = PluginOption & {
  /**
   * 耗时阈值
   */
  duration?: number
  /**
   * 请求体大小阈值
   */
  reqBodySized?: number
  /**
   * 响应体大小阈值
   */
  resBodySize?: number
  /**
   * 错误HTTP码，支持数组和单个数字
   */
  errorHttpCode?: Array<number> | number
  /**
   * 错误业务码，支持数组
   */
  errorBusinessCode?: Array<number>
}

const defaultRequestPluginOption: RequestPluginOption = {
  duration: 1000,
  reqBodySized: 1000,
  resBodySize: 1000,
  errorHttpCode: 400,
  errorBusinessCode: [500]
}

const WX_API_HOOKS = ['request']

type ApiDuration = ApiReport & {
  duration: number
  reqPage: string
  resPage: string
  network: string
  queueTime?: number
  queueStart?: number
  queueEnd?: number
}

type ApiBodySize = ApiReport & {
  reqBodySize: number
  resBodySize: number
}

type ApiErrorHttpCode = ApiReport & {
  errorReason: string
}

type ApiErrorBusinessCode = ApiReport & {
  errorCode: number
  errorReason: string
}

/**
 * 数据收集策略接口
 */
interface DataCollectorStrategy {
  shouldCollect(data: any): boolean
  collect(data: any): Promise<any>
}

async function getNetworkType(): Promise<string> {
  return new Promise((resolve) => {
    wx.getNetworkType({
      success: (res) => {
        resolve(res.networkType)
      },
      fail: () => {
        resolve('unknown')
      }
    })
  })
}

/**
 * 耗时数据收集策略
 */
class DurationCollector implements DataCollectorStrategy {
  constructor(private threshold: number) {}

  shouldCollect(data: any): boolean {
    return data.duration && data.duration > this.threshold
  }

  async collect(data: any): Promise<ApiDuration> {
    const network = await getNetworkType()
    return {
      type: MONITOR_TYPE.API,
      subType: API_SUB_TYPE.DURATION,
      url: data.url,
      method: data.method,
      statusCode: data.statusCode,
      duration: data.duration,
      reqPage: data.reqPage,
      resPage: data.resPage,
      network,
      queueTime: data.queueTime,
      queueStart: data.queueStart,
      queueEnd: data.queueEnd
    }
  }
}

/**
 * 请求体大小收集策略
 */
class BodySizeCollector implements DataCollectorStrategy {
  constructor(
    private reqThreshold: number,
    private resThreshold: number
  ) {}

  shouldCollect(data: any): boolean {
    return (
      (data.reqBodySize && data.reqBodySize > this.reqThreshold) ||
      (data.resBodySize && data.resBodySize > this.resThreshold)
    )
  }

  async collect(data: any): Promise<ApiBodySize> {
    return {
      type: MONITOR_TYPE.API,
      subType: API_SUB_TYPE.BODY_SIZE,
      url: data.url,
      method: data.method,
      statusCode: data.statusCode,
      reqBodySize: data.reqBodySize || 0,
      resBodySize: data.resBodySize || 0
    }
  }
}

/**
 * HTTP错误码收集策略
 */
class HttpErrorCollector implements DataCollectorStrategy {
  constructor(private errorCodes: Array<number> | number) {}

  shouldCollect(data: any): boolean {
    if (!data.statusCode) return false
    if (Array.isArray(this.errorCodes)) {
      return this.errorCodes.includes(data.statusCode)
    }
    return data.statusCode >= this.errorCodes
  }

  async collect(data: any): Promise<ApiErrorHttpCode> {
    return {
      type: MONITOR_TYPE.API,
      subType: API_SUB_TYPE.ERROR_HTTP_CODE,
      url: data.url,
      method: data.method,
      statusCode: data.statusCode,
      errorReason: data.errorReason || ''
    }
  }
}

/**
 * 业务错误码收集策略
 */
class BusinessErrorCollector implements DataCollectorStrategy {
  constructor(private errorCodes: Array<number>) {}

  shouldCollect(data: any): boolean {
    return data.errorCode && this.errorCodes.includes(data.errorCode)
  }

  async collect(data: any): Promise<ApiErrorBusinessCode> {
    return {
      type: MONITOR_TYPE.API,
      subType: API_SUB_TYPE.ERROR_BUSINESS_CODE,
      url: data.url,
      method: data.method,
      statusCode: data.statusCode,
      errorCode: data.errorCode,
      errorReason: data.errorReason || ''
    }
  }
}

/**
 * 请求数据收集器
 * 使用策略模式管理不同的数据收集逻辑
 */
class RequestDataCollector {
  private strategies: DataCollectorStrategy[]

  constructor(
    private notify: NotifyFunc,
    options: RequestPluginOption
  ) {
    this.strategies = [
      new DurationCollector(options.duration!),
      new BodySizeCollector(options.reqBodySized!, options.resBodySize!),
      new HttpErrorCollector(options.errorHttpCode!),
      new BusinessErrorCollector(options.errorBusinessCode!)
    ]
  }

  /**
   * 收集所有符合条件的数据
   */
  async collect(data: any): Promise<void> {
    this.strategies.forEach(async (strategy) => {
      if (strategy.shouldCollect(data)) {
        const collectedData = await strategy.collect(data)
        this.notify(collectedData)
      }
    })
  }

  /**
   * 处理请求响应
   */
  handleResponse(options: any, response: any, startTime: number, route: string): void {
    const endTime = new Date().getTime()
    const duration = endTime - startTime
    const { url, method } = options
    const { statusCode, profile, data } = response
    const { queueStart, queueEnd, sendBytesCount, receivedBytedCount } = profile || {}
    const { code: businessCode, msg: businessMsg, error: errorReason } = data || {}

    this.collect({
      url,
      method,
      duration,
      statusCode,
      queueStart,
      queueEnd,
      businessCode,
      businessMsg,
      sendBytesCount,
      receivedBytedCount,
      reqPage: route,
      resPage: route,
      errorReason
    })
  }

  /**
   * 处理请求错误
   */
  handleError(options: any, error: any, startTime: number, route: string): void {
    const endTime = new Date().getTime()
    const duration = endTime - startTime
    const { url, method } = options
    const { errMsg, errno } = error

    this.collect({
      url,
      method,
      duration,
      errorReason: errMsg,
      errCode: errno,
      reqPage: route,
      resPage: route
    })
  }
}

function getRoute(): string {
  if (!getCurrentPages) return ''
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  return currentPage.route
}

/**
 * 重写微信请求方法
 */
function overrideWxRequest(collector: RequestDataCollector): void {
  WX_API_HOOKS.forEach((hook) => {
    const originalRequest = wx[hook]

    Object.defineProperty(wx, hook, {
      writable: true,
      enumerable: true,
      configurable: true,
      value: (...args: any[]) => {
        const options = args[0]
        const startTime = new Date().getTime()
        const route = getRoute()

        // 处理 complete 回调
        if (options.complete) {
          const originalComplete = options.complete
          options.complete = (res: any) => {
            collector.handleResponse(options, res, startTime, route)
            originalComplete(res)
          }
        } else {
          // 处理 success 和 fail 回调
          const originalSuccess = options.success || (() => {})
          const originalFail = options.fail || (() => {})

          options.success = (res: any) => {
            collector.handleResponse(options, res, startTime, route)
            originalSuccess(res)
          }

          options.fail = (err: any) => {
            collector.handleError(options, err, startTime, route)
            originalFail(err)
          }
        }

        originalRequest.apply(wx, args)
      }
    })
  })
}

function requestPlugin(pluginOption?: RequestPluginOption): BasePluginType {
  return {
    name: 'requestPlugin',
    monitor(notify: NotifyFunc) {
      const options = { ...defaultRequestPluginOption, ...pluginOption }
      const collector = new RequestDataCollector(notify, options)
      overrideWxRequest(collector)
    }
  }
}

export default requestPlugin
