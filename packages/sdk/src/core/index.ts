import { Subscribe } from './subscribe'
import { BaseOptionsType, BasePluginType, IAnyObject } from './type'

export abstract class Core<Options extends BaseOptionsType> {
  private options!: Options
  protected taskQueue: Array<IAnyObject> = []
  protected isReady = false
  constructor(options: Options) {
    this.initOptions(options)
    this.initClient().then(() => {
      this.isReady = true
      this.executeTaskQueue()
    })
  }
  private initOptions(options: Options) {
    const { host, report, pid, aid } = options
    if ([host, report, pid, aid].some((item) => !item)) {
      throw new Error('options is not valid')
    }
    this.options = {
      ...options
    }
  }
  /**
   * 执行任务队列
   */
  executeTaskQueue() {
    while (this.taskQueue.length) {
      const task = this.taskQueue.shift()
      if (task) {
        this.report(task)
      }
    }
  }
  /**
   * 引用插件
   * @param {BasePluginType[]} plugins - 用户传入的应用信息
   */
  use(plugins: BasePluginType[]) {
    const { report } = this.options
    const sub = new Subscribe()
    const map = new Map<string, number>()
    for (const plugin of plugins) {
      const { name, monitor, transform } = plugin || {}
      if (!name || !monitor) {
        console.warn(`The plugin missing name or monitor.`)
        continue
      }
      if (map.has(name)) {
        console.warn(`The plugin name [${name}] is duplicate, please modify it.`)
        continue
      }
      map.set(name, 1)
      try {
        monitor.call(this, sub.notify.bind(sub, name))
      } catch (error) {
        console.error(error)
      }
      const callback = (...args: any[]) => {
        const pluginDatas = typeof transform === 'function' ? transform.apply(this, args) : args
        if (!pluginDatas) {
          return
        }
        const datas = this.transform(pluginDatas)
        if (!datas) {
          return
        }
        if (!this.isReady) {
          // 应用未初始化，暂存任务
          this.taskQueue.push(datas)
          return
        }
        this.report({ ...datas })
      }
      sub.watch(name, callback)
    }
  }

  getOptions() {
    return { ...this.options }
  }
  /**
   * 抽象方法，用于初始化客户端
   */
  abstract initClient(): Promise<void>

  /**
   * 抽象方法，用于转换数据
   * @param data 原始数据
   * @returns 转换后的数据
   */
  abstract transform(data: IAnyObject): IAnyObject
  /**
   * 抽象方法，调用接口发送数据
   * @param fn 事件函数
   * @param args 事件参数
   */
  abstract send(...args: any[]): Promise<any>
  addReportInfo<T extends { retryTimes?: number; reportTime?: number }>(reportData: T): T {
    const reportTime = new Date().getTime()
    if (reportData.retryTimes) {
      reportData.retryTimes++
    } else {
      reportData.retryTimes = 1
    }
    reportData.reportTime = reportTime
    return reportData
  }
  /**
   * 抽象方法，记录上报数据
   */
  abstract report(data: IAnyObject): void
}
