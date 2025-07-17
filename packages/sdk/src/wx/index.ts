import { BreadcrumbPushData, IAnyObject, ReportData } from '@/core/type'
import { Core } from '../core'
import { WXOptionsType } from './type'
import requestPlugin from './plugins/requestPlugin'
import onAppHidePlugin from './plugins/onAppHidePlugin'
import logPlugin, { reportLog } from './plugins/logPlugin'

export class WXCore extends Core<WXOptionsType> {
  private wxSettings: IAnyObject = {}

  constructor(options: WXOptionsType) {
    super(options)
  }

  async initClient() {
    console.log('initClient')
    this.wxSettings = await this.getWxSettings()
    const { uid } = this.getOptions()
    this.regenerateSessionId({ uid: uid || 'anonymous', deviceInfo: this.wxSettings })
  }
  transform(data: ReportData): any {
    if (!data) return data
    const { model, platform } = this.wxSettings
    const { pid, aid, sid, uid } = this.getOptions()
    const reportData = {
      ...data,
      model,
      platform,
      pid,
      aid,
      sid: sid || '',
      uid: uid || 'anonymous'
    }
    return this.addReportInfo(reportData)
  }
  async send(data: BreadcrumbPushData[]) {
    const { report, host, reqOption, timeout } = this.getOptions()
    const reportData = this.transform({ list: data })
    return new Promise((resolve, reject) => {
      const options = typeof reqOption === 'function' ? reqOption(resolve, reject) : {}
      wx.request({
        success: (result) => resolve(result),
        fail: (res) => reject(res),
        url: `${host}${report}`,
        method: 'POST',
        ...options,
        data: reportData,
        dataType: 'json',
        timeout: timeout || 10000
      })
    })
  }

  async getWxSettings() {
    // @ts-expect-error wx.getDeviceInfo() 在微信小程序环境中可用，但 TypeScript 类型定义可能不完整
    const { model, platform, brand, system } = wx.getDeviceInfo()
    return {
      brand,
      model,
      platform,
      system
    }
  }
}

const init = (options: WXOptionsType) => {
  const client = new WXCore(options)
  const { plugins = [] } = options
  client.use([requestPlugin(), onAppHidePlugin(), logPlugin(), ...plugins])
  return {
    regenerateSessionId: client.regenerateSessionId.bind(client),
    reportLog
  }
}

export default init
