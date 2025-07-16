import { Subscribe } from './subscribe'
import { BaseOptionsType, BasePluginType, BreadcrumbPushData, IAnyObject } from './type'
import { Breadcrumb } from './breadcrumb'
import { CallbackStrategyManager } from './callback-strategy'
import { CALLBACK_TYPE } from './constant'

export abstract class Core<Options extends BaseOptionsType> {
  private options!: Options
  protected isReady = false
  protected breadcrumb: Breadcrumb<Options>
  private callbackStrategyManager: CallbackStrategyManager<Core<Options>>

  constructor(options: Options) {
    this.initOptions(options)
    this.breadcrumb = new Breadcrumb(options)
    this.callbackStrategyManager = new CallbackStrategyManager<Core<Options>>()
    this.initClient().then(() => {
      this.isReady = true
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
   * 生成会话ID
   * 在应用销毁前，此ID都是唯一的，包含用户信息和设备信息
   */
  private generateSessionId({ uid, deviceInfo }: { uid: string; deviceInfo: IAnyObject }): void {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 15)
    const { aid, pid } = this.options
    // 组合会话ID：时间戳 + 随机数 + 应用ID + 项目ID + 设备信息 + 用户信息
    const sessionComponents = [
      timestamp.toString(36),
      random,
      aid,
      pid,
      deviceInfo.platform || 'unknown',
      deviceInfo.system || 'unknown',
      uid || 'anonymous'
    ]

    const sessionId = sessionComponents.join('_')
    this.options = {
      ...this.options,
      sid: sessionId,
      uid
    }
  }

  /**
   * 重新生成会话ID
   * 可用于用户登录状态变化
   */
  regenerateSessionId({ uid, deviceInfo }: { uid: string; deviceInfo: IAnyObject }): void {
    this.generateSessionId({ uid, deviceInfo })
  }
  /**
   * 引用插件
   * @param {BasePluginType[]} plugins - 用户传入的应用信息
   */
  use(plugins: BasePluginType[]) {
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
      const callback = (data: any, type?: CALLBACK_TYPE) => {
        const pushData = typeof transform === 'function' ? transform.apply(this, [data]) : data

        // 使用策略模式处理不同的回调类型
        // 未准备就绪，走缓存策略
        const strategyType = this.isReady ? type || CALLBACK_TYPE.CACHE : CALLBACK_TYPE.CACHE
        this.callbackStrategyManager.execute(strategyType, this, pushData)
      }
      sub.watch(name, callback)
    }
  }

  getOptions() {
    return { ...this.options }
  }

  /**
   * 添加数据到缓存队列
   */
  async pushBreadcrumb(data: BreadcrumbPushData) {
    // 添加数据到分组队列
    await this.breadcrumb.push(data)

    // 检查当前分组是否已满
    const { type, subType } = data
    if (this.breadcrumb.isGroupFull(type, subType)) {
      // 获取该分组的所有数据
      const groupData = this.breadcrumb.getStackByGroup(type, subType)
      if (groupData.length === 0) return

      // 直接发送该分组的数据
      try {
        await this.send(groupData)
        // 发送成功后清空该分组
        await this.breadcrumb.clearGroup(type, subType)
      } catch (error) {
        console.warn('Failed to send breadcrumb data:', error)
        // 发送失败时更新重试次数并决定是否丢弃数据
        await this.handleSendFailure(groupData, type, subType)
      }
    }
  }
  addLogTime(data: BreadcrumbPushData) {
    const logTime = new Date().getTime()
    return { ...data, logTime }
  }
  addReportInfo<T extends IAnyObject>(
    reportData: T
  ): T & { retryTimes: number; reportTime: number } {
    const reportTime = new Date().getTime()
    const result = { ...reportData } as T & { retryTimes: number; reportTime: number }
    if (result.retryTimes) {
      result.retryTimes++
    } else {
      result.retryTimes = 1
    }
    result.reportTime = reportTime
    return result
  }
  /**
   * 抽象方法，用于初始化客户端
   */
  abstract initClient(): Promise<void>

  /**
   * 抽象方法，用于添加、修改数据
   * @param data 原始数据
   * @returns 转换后的数据
   */
  abstract transform(data: IAnyObject): IAnyObject
  /**
   * 抽象方法，调用接口发送数据，按分组发送
   * @param fn 事件函数
   * @param args 事件参数
   */
  protected abstract send(args: BreadcrumbPushData[]): Promise<any>
  /**
   * 清空缓存队列
   */
  async flush() {
    const allGroupData = this.breadcrumb.getAllGroupData()

    if (Object.keys(allGroupData).length === 0) return

    // 并行发送所有分组数据
    const sendPromises = Object.entries(allGroupData).map(async ([groupKey, groupData]) => {
      if (groupData.length === 0) return

      try {
        await this.send(groupData)
        // 发送成功后清空该分组
        await this.breadcrumb.clearGroupByKey(groupKey)
      } catch (error) {
        console.warn(`Failed to send group data for ${groupKey}:`, error)
        // 发送失败时更新重试次数并决定是否丢弃数据
        await this.handleSendFailure(groupData, groupKey)
      }
    })

    // 等待所有发送任务完成
    await Promise.all(sendPromises)
  }

  /**
   * 处理发送失败的情况
   * @param groupData 分组数据
   * @param typeOrGroupKey 数据类型或分组键
   * @param subType 数据子类型（当第一个参数为type时使用）
   */
  private async handleSendFailure(
    groupData: BreadcrumbPushData[],
    typeOrGroupKey: string,
    subType?: string
  ): Promise<void> {
    const maxRetryTimes = this.options.retryTimes || 3
    const updatedData = groupData.map((data) => {
      const currentRetryTimes = (data.retryTimes || 0) + 1
      return { ...data, retryTimes: currentRetryTimes }
    })

    // 过滤出未超过最大重试次数的数据
    const validData = updatedData.filter((data) => (data.retryTimes || 0) <= maxRetryTimes)

    // 更新分组数据（只保留未超过重试次数的数据）
    if (subType !== void 0) {
      // 使用 type 和 subType 更新分组
      await this.breadcrumb.updateGroupData(typeOrGroupKey, subType, validData)
    } else {
      // 使用分组键更新分组
      await this.breadcrumb.updateGroupDataByKey(typeOrGroupKey, validData)
    }
  }

  /**
   * 立即上报数据
   */
  report(data: BreadcrumbPushData) {
    return this.send([data])
  }
  /**
   * 添加数据到缓存队列
   */
  addReport(data: BreadcrumbPushData) {
    // 将数据添加到缓存队列中
    return this.pushBreadcrumb(data)
  }
}
