import { API_SUB_TYPE, MONITOR_TYPE } from '@/core/constant'
import { BaseOptionsType, IAnyObject } from '../core/type'

export type WXOptionsType = BaseOptionsType & {
  /**
   * wx.request配置项
   */
  reqOption?: (
    resolve: (
      value:
        | WechatMiniprogram.GeneralCallbackResult
        | PromiseLike<WechatMiniprogram.GeneralCallbackResult>
    ) => void,
    reject: (reason?: any) => void
  ) => WechatMiniprogram.RequestOption
}

export type PluginOption = IAnyObject

export type BaseReport = {
  type: MONITOR_TYPE
  subType: API_SUB_TYPE
}

export type ApiReport = BaseReport & {
  url: string
  method: string
  statusCode: number
}

export type PerformanceReport = BaseReport & {
  duration: number
  bodySize: number
}

export type ErrorReport = BaseReport & {
  errorMessage: string
  errorCode: string
  errorStack: string
}

export type FreLogReport = BaseReport & {
  logType: string
  logContent: string
  logKeywords: string
}
