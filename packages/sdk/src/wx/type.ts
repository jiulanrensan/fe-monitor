import { BaseOptionsType } from '../core/type'

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
