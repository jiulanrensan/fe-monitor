import { API_SUB_TYPE, CALLBACK_TYPE, MONITOR_TYPE } from './constant'

export type BaseOptionsType = {
  /**
   * 上报域名
   */
  host: string
  /**
   * 上报接口地址
   */
  report: string
  /**
   * 项目ID
   */
  pid: string
  /**
   * 应用ID
   */
  aid: string
  /**
   * 用户ID
   */
  uid?: string
  /**
   * 会话ID
   */
  sid?: string
  /**
   * 插件
   */
  plugins?: BasePluginType[]
  /**
   * 面包屑最大层级
   */
  maxBreadcrumbs?: number
  /**
   * 超时时间
   */
  timeout?: number
  /**
   * 重试次数
   */
  retryTimes?: number
}

export type IAnyObject = Record<string, any>

/**
 * 上报数据结构
 */
export type ReportData = {
  list: BreadcrumbPushData[]
  [x: string]: any
}

export type NotifyFunc = (data: any, type?: CALLBACK_TYPE) => void
export interface BasePluginType {
  /** 插件名称 */
  name: string
  /** 监控事件 */
  monitor: (notify: NotifyFunc) => void
  /** 添加数据、数据处理 */
  transform?: (...args: any[]) => any
  [key: string]: any
}

export type AnyFunc = (...args: any[]) => any

export type BreadcrumbPushData = {
  type: MONITOR_TYPE
  subType?: API_SUB_TYPE
  [x: string]: any
}
