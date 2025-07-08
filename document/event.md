# 监控事件

## 分为三大类

```ts
const MONITOR_TYPE = {
  /**
   * API类型: 接口调用相关(包含接口异常、接口耗时)
   */
  API: 'API',
  /**
   * 错误类型，代码异常
   */
  ERROR: 'ERROR',
  /**
   * 性能类型: 页面性能相关(包含页面加载、页面渲染、页面交互)
   */
  PERFORMANCE: 'PERFORMANCE',
  /**
   * 前端日志打印
   */
  FRE_LOG: 'FRE_LOG'
} as const
```

## 上报事件公共属性

```shell
aid # 应用id
sid # 会话id 应用生命周期内唯一
uid # 用户id
logtime # 记录时间
reportTime # 上报时间
retryTimes # 重试次数
model # 机型
```

## 每个大类下可以细分小类

名称规范为：`前缀为大类名称+'__'+细分小类名称`

### API事件

```ts
export const API_EVENT_TYPE = {
  /**
   * 接口耗时
   */
  API__DURATION: API__DURATION,
  /**
   * 接口req、res的body体积
   */
  API__BODY_SIZE: API__BODY_SIZE,
  /**
   * http状态码失败
   */
  API__ERROR_HTTP_CODE: API__ERROR_HTTP_CODE,
  /**
   * 业务状态码失败
   */
  API__ERROR_BUSINESS_CODE: API__ERROR_BUSINESS_CODE
}
```

## `API__DURATION`事件需要的字段信息

```shell
url
method
statusCode # HTTP 状态码
duration # 请求总耗时：含等待耗时、处理耗时
queueTime # 等待耗时 网络请求的并发数上限为10个。当并发请求达到10个时，来了第11个请求，这个请求需要等到第1个请求结束才能开始。这里的耗时即“等待耗时”
# 处理耗时为 duration - queueTime
queueStart # 开始排队的时间
queueEnd # 结束排队的时间
reqPage # 发起请求时的页面路径
resPage # 获取到响应时的页面路径
network # 请求时的网络状态
```

## `API__BODY_SIZE`事件需要的字段信息

```shell
url
method
statusCode # HTTP 状态码
reqBodySize # 单位kb
resBodySize # 单位kb
```

## `API__ERROR_HTTP_CODE`事件需要的字段信息

```shell
url
method
statusCode # HTTP 状态码
errorReason # 失败原因
```

## `API__ERROR_BUSINESS_CODE`事件需要的字段信息

```shell
url
method
statusCode # HTTP 状态码
businessCode # 业务异常码
errMsg # 异常原因
```
