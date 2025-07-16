import { CALLBACK_TYPE } from './constant'
import { BreadcrumbPushData } from './type'
type CoreFunc = (data: BreadcrumbPushData) => Promise<any>
type CoreTypeInterface = {
  report: CoreFunc
  flush: () => Promise<any>
  addReport: CoreFunc
}

/**
 * 回调策略接口
 */
export interface CallbackStrategy<CoreType> {
  execute(core: CoreType, data: BreadcrumbPushData): void | Promise<void>
}

/**
 * 缓存策略：加入缓存队列
 */
class CacheStrategy<CoreType extends CoreTypeInterface> implements CallbackStrategy<CoreType> {
  async execute(core: CoreType, data: BreadcrumbPushData) {
    await core.addReport(data)
  }
}

/**
 * 立即上报策略：立即上报数据
 */
class DirectSendStrategy<CoreType extends CoreTypeInterface> implements CallbackStrategy<CoreType> {
  async execute(core: CoreType, data: BreadcrumbPushData) {
    await core.report(data)
  }
}

/**
 * 刷新策略：发送缓存队列数据
 */
class FlushStrategy<CoreType extends CoreTypeInterface> implements CallbackStrategy<CoreType> {
  async execute(core: CoreType) {
    try {
      await core.flush()
    } catch (error) {
      console.error('Failed to send data directly:', error)
    }
  }
}

/**
 * 回调策略管理器
 */
export class CallbackStrategyManager<CoreType extends CoreTypeInterface> {
  private strategies: Map<string, CallbackStrategy<CoreType>> = new Map()

  constructor() {
    this.registerStrategies()
  }

  private registerStrategies(): void {
    this.strategies.set(CALLBACK_TYPE.CACHE, new CacheStrategy<CoreType>())
    this.strategies.set(CALLBACK_TYPE.FLUSH, new FlushStrategy<CoreType>())
    this.strategies.set(CALLBACK_TYPE.DIRECT_SEND, new DirectSendStrategy<CoreType>())
  }

  /**
   * 执行策略
   * @param type 策略类型
   * @param core Core实例
   * @param data 数据
   */
  execute(type: CALLBACK_TYPE, core: CoreType, data: any): void | Promise<void> {
    // 回调类型不为flush时，过滤掉空数据
    if (![CALLBACK_TYPE.FLUSH].includes(type) && !data) return
    const strategy = this.strategies.get(type) || this.strategies.get(CALLBACK_TYPE.CACHE)
    return strategy!.execute(core, data as BreadcrumbPushData)
  }

  /**
   * 注册新的策略
   * @param type 策略类型
   * @param strategy 策略实现
   */
  registerStrategy(type: string, strategy: CallbackStrategy<CoreType>): void {
    this.strategies.set(type, strategy)
  }
}
