import { AnyFunc, BasePluginType, NotifyFunc } from '@/core/type'
import { CALLBACK_TYPE, MONITOR_TYPE } from '@/core/constant'
import { PluginOption } from '../type'

type LogPluginOption = PluginOption & {}

export type ReportLogType = {
  type?: 'log' | 'error'
  content: string
  keywords?: string
}

/**
 * 将 key 加上 log 前缀并转为驼峰命名
 */
type AddLogPrefix<T> = {
  [K in keyof T as K extends string ? `log${Capitalize<K>}` : never]: T[K]
}

type ReportLogData = AddLogPrefix<ReportLogType>

function addLogPrefix(data: ReportLogType): ReportLogData {
  const newData = {} as ReportLogData

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      const camelKey = key.charAt(0).toUpperCase() + key.slice(1)
      const logKey = `log${camelKey}` as keyof ReportLogData
      ;(newData as any)[logKey] = value
    }
  })

  return newData
}

// 创建一个插件实例类来管理状态
class LogPluginInstance {
  private notify: NotifyFunc | null = null

  // 绑定通知函数
  bindNotify(notify: NotifyFunc) {
    this.notify = notify
  }

  // 报告日志方法
  reportLog(data: ReportLogType) {
    if (!this.notify) {
      return
    }

    console.log('reportLog', addLogPrefix(data))
    this.notify(
      {
        type: MONITOR_TYPE.FRE_LOG,
        ...addLogPrefix(data)
      },
      CALLBACK_TYPE.DIRECT_SEND
    )
  }
}

// 创建全局插件实例
const logPluginInstance = new LogPluginInstance()

// 导出 reportLog 方法供外部调用
export const reportLog = (data: ReportLogType) => {
  logPluginInstance.reportLog(data)
}

function logPlugin(): BasePluginType {
  return {
    name: 'logPlugin',
    monitor(notify) {
      logPluginInstance.bindNotify(notify)
    },
    transform(data: ReportLogData) {
      return {
        ...data,
        logType: data.logType || 'log'
      }
    }
  }
}

export default logPlugin
