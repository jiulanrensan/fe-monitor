// import { WX_API_HOOKS } from './const'
// function getRoute() {
//   if (!getCurrentPages) return ''
//   const pages = getCurrentPages()
//   const currentPage = pages[pages.length - 1]
//   return currentPage.route
// }
// function overrideComplete({ options, res, start }) {
//   const { statusCode, profile, data } = res
//   const end = new Date().getTime()
//   const duration = end - start
//   const { url, method } = options
//   // http码异常时，data的结构： { error }
//   const route = getRoute()
//   const { queueStart, queueEnd, sendBytesCount, receivedBytedCount } = profile || {}
//   const { code: businessCode, msg: businessMsg } = data
//   console.log('success', {
//     url,
//     method,
//     duration,
//     route,
//     statusCode,
//     queueStart,
//     queueEnd,
//     businessCode,
//     businessMsg,
//     sendBytesCount,
//     receivedBytedCount
//   })
// }
// function overrideFail({ options, err, start }) {
//   const end = new Date().getTime()
//   const duration = end - start
//   const { url, method, data } = options
//   const route = getRoute()
//   const { errMsg, errno } = err
//   console.log('fail', url, method, duration, route, data, errMsg, errno)
// }
// function overrideRequest() {
//   console.log('before overrideRequest')
//   WX_API_HOOKS.forEach((hook) => {
//     const originRequest = wx[hook]
//     Object.defineProperty(wx, hook, {
//       writable: true,
//       enumerable: true,
//       configurable: true,
//       value: (...args) => {
//         // originRequest.apply(wx, args)
//         const options = args[0]
//         const originComplete = options.complete || (() => {})
//         const start = new Date().getTime()
//         options.complete = (res) => {
//           overrideComplete({ options, res, start })
//           originComplete(res)
//         }
//         originRequest.apply(wx, args)
//       }
//     })
//   })
// }

// export default overrideRequest

import { IAnyObject } from '@/core/type'
import { Core } from '../core'
import { WXOptionsType } from './type'

export class WXCore extends Core<WXOptionsType> {
  private wxSettings: IAnyObject = {}
  constructor(options: WXOptionsType) {
    super(options)
  }
  async initClient() {
    console.log('initClient')
    this.wxSettings = await this.getWxSettings()
  }
  transform(data: IAnyObject): any {
    if (!data) return null
    const { brand, model, platform } = this.wxSettings
    const { pid, aid } = this.getOptions()
    return {
      ...data,
      brand,
      model,
      platform,
      logTime: new Date().getTime(),
      pid,
      aid
    }
  }
  async send(data: IAnyObject) {
    const { report, host, reqOption } = this.getOptions()

    return new Promise((resolve, reject) => {
      const options = typeof reqOption === 'function' ? reqOption(resolve, reject) : {}
      const task = wx.request({
        success: (result) => {
          resolve(result)
        },
        fail: (res) => reject(res),
        url: `${host}${report}`,
        method: 'POST',
        ...options,
        data: this.addReportInfo(data),
        dataType: 'json',
        complete: () => {
          // this.requestTasks.delete(task);
        }
      })
      // this.requestTasks.set(task, data);
    })
  }
  report(data: IAnyObject) {
    console.log('report', data)
  }
  async getWxSettings() {
    // @ts-expect-error wx.getDeviceInfo() 在微信小程序环境中可用，但 TypeScript 类型定义可能不完整
    const { model, platform, brand } = wx.getDeviceInfo()
    return {
      brand,
      model,
      platform
    }
  }
}
