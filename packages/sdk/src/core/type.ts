export type BaseOptionsType = {
    /**
     * 上报域名
     */
    host: string
    /**
     * 上报接口地址
     */
    report: string
    /**
     * 项目ID
     */
    pid: string
    /**
     * 应用ID
     */
    aid: string
    /**
     * 插件
     */
    //   plugins?: BasePluginType[];
    /**
     * 面包屑最大层级
     */
    maxBreadcrumbs?: number
  }
  
  export type IAnyObject = Record<string, any>
  
  export interface BasePluginType {
    /** 插件名称 */
    name: string
    /** 监控事件 */
    monitor: (notify: (data: any) => void) => void
    /** 数据格式转换 */
    transform?: (...args: any[]) => any
    [key: string]: any
  }
  
  export type UnknownFunc = (...args: unknown[]) => void
  