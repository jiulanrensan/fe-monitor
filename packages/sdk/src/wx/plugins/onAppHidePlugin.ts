import { AnyFunc, BasePluginType, NotifyFunc } from '@/core/type'
import { CALLBACK_TYPE } from '@/core/constant'
import { PluginOption } from '../type'

type OnAppHidePluginOption = PluginOption & {}

function handleOnAppHide({ notify }: { notify: NotifyFunc }) {
  wx.onAppHide(() => {
    notify(void 0, CALLBACK_TYPE.FLUSH)
  })
}

function onAppHidePlugin(): BasePluginType {
  return {
    name: 'onAppHidePlugin',
    monitor(notify) {
      handleOnAppHide({ notify })
    }
    // transform(data: any) {
    //   // 可以在这里对数据进行进一步处理
    //   return {
    //     ...data,
    //   }
    // }
  }
}

export default onAppHidePlugin
