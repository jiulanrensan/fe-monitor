import { AnyFunc, BasePluginType, NotifyFunc } from '@/core/type'
import { CALLBACK_TYPE, MONITOR_TYPE } from '@/core/constant'
import { PluginOption } from '../type'

type LogPluginOption = PluginOption & {}

export type ReportLogType = {
  logType?: 'log' | 'error'
  logContent: string
  logKeywords?: string
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

    console.log('reportLog', data)
    this.notify(
      {
        type: MONITOR_TYPE.FRE_LOG,
        ...data
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
    transform(data: ReportLogType) {
      return {
        ...data,
        logType: data.logType || 'log'
      }
    }
  }
}

export default logPlugin
