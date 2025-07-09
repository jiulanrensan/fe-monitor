import { WX_API_HOOKS } from './const'
import { getRoute } from './utils'

function overrideComplete({ options, res, start }) {
  const { statusCode, profile, data } = res
  const end = new Date().getTime()
  const duration = end - start
  const { url, method } = options
  // http码异常时，data的结构： { error }
  const route = getRoute()
  const { queueStart, queueEnd, sendBytesCount, receivedBytedCount } = profile || {}
  const { code: businessCode, msg: businessMsg } = data
  console.log('success', {
    url,
    method,
    duration,
    route,
    statusCode,
    queueStart,
    queueEnd,
    businessCode,
    businessMsg,
    sendBytesCount,
    receivedBytedCount
  })
}
function overrideFail({ options, err, start }) {
  const end = new Date().getTime()
  const duration = end - start
  const { url, method, data } = options
  const route = getRoute()
  const { errMsg, errno } = err
  console.log('fail', url, method, duration, route, data, errMsg, errno)
}
function overrideRequest() {
  console.log('before overrideRequest')
  WX_API_HOOKS.forEach((hook) => {
    const originRequest = wx[hook]
    Object.defineProperty(wx, hook, {
      writable: true,
      enumerable: true,
      configurable: true,
      value: (...args) => {
        // originRequest.apply(wx, args)
        const options = args[0]
        const originComplete = options.complete || (() => {})
        const start = new Date().getTime()
        options.complete = (res) => {
          overrideComplete({ options, res, start })
          originComplete(res)
        }
        originRequest.apply(wx, args)
      }
    })
  })
}

export default overrideRequest
