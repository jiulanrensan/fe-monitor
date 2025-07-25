import { CALLBACK_TYPE } from './constant'
import { AnyFunc } from './type'

/**
 * 发布订阅类
 */
export class Subscribe {
  dep: Map<string, AnyFunc[]> = new Map()
  watch(eventName: string, callBack: (data: any, type?: CALLBACK_TYPE) => any) {
    const fns = this.dep.get(eventName)
    if (fns) {
      this.dep.set(eventName, fns.concat(callBack))
      return
    }
    this.dep.set(eventName, [callBack])
  }
  notify<D = any>(eventName: string, data: D, type?: CALLBACK_TYPE) {
    const fns = this.dep.get(eventName)
    if (!eventName || !fns) return
    fns.forEach((fn) => {
      try {
        fn(data, type)
      } catch (err) {
        console.error(err)
      }
    })
  }
}
