import { BaseOptionsType, BreadcrumbPushData } from './type'

/**
 * 存储适配器接口
 */
interface StorageAdapter {
  get(key: string): Promise<string | null> | string | null
  set(key: string, value: any): Promise<void> | void
  remove(key: string): Promise<void> | void
  clear(): Promise<void> | void
}

/**
 * 浏览器环境存储适配器
 */
class BrowserStorageAdapter implements StorageAdapter {
  private storage: any

  constructor(useSessionStorage = false) {
    this.storage = useSessionStorage ? globalThis.sessionStorage : globalThis.localStorage
  }

  get(key: string): string | null {
    try {
      const data = this.storage.getItem(key)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.warn('Failed to get item from storage:', error)
      return null
    }
  }

  set(key: string, value: string): void {
    try {
      this.storage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.warn('Failed to set item to storage:', error)
    }
  }

  remove(key: string): void {
    try {
      this.storage.removeItem(key)
    } catch (error) {
      console.warn('Failed to remove item from storage:', error)
    }
  }

  clear(): void {
    try {
      this.storage.clear()
    } catch (error) {
      console.warn('Failed to clear storage:', error)
    }
  }
}

/**
 * 微信小程序环境存储适配器 - 异步API
 */
class WxStorageAdapter implements StorageAdapter {
  async get(key: string): Promise<string | null> {
    try {
      return new Promise((resolve) => {
        wx.getStorage({
          key,
          success: (res: any) => {
            resolve(res.data || null)
          },
          fail: () => {
            resolve(null)
          }
        })
      })
    } catch (error) {
      console.warn('Failed to get item from wx storage:', error)
      return null
    }
  }

  async set(key: string, value: any): Promise<void> {
    try {
      return new Promise((resolve, reject) => {
        wx.setStorage({
          key,
          data: value,
          success: () => {
            resolve()
          },
          fail: (error: any) => {
            console.warn('Failed to set item to wx storage:', error)
            reject(error)
          }
        })
      })
    } catch (error) {
      console.warn('Failed to set item to wx storage:', error)
    }
  }

  async remove(key: string): Promise<void> {
    try {
      return new Promise((resolve, reject) => {
        wx.removeStorage({
          key,
          success: () => {
            resolve()
          },
          fail: (error: any) => {
            console.warn('Failed to remove item from wx storage:', error)
            reject(error)
          }
        })
      })
    } catch (error) {
      console.warn('Failed to remove item from wx storage:', error)
    }
  }

  async clear(): Promise<void> {
    try {
      return new Promise((resolve, reject) => {
        wx.clearStorage({
          success: () => {
            resolve()
          },
          fail: (error: any) => {
            console.warn('Failed to clear wx storage:', error)
            reject(error)
          }
        })
      })
    } catch (error) {
      console.warn('Failed to clear wx storage:', error)
    }
  }
}

/**
 * 存储工厂类
 */
class StorageFactory {
  static createStorage(): StorageAdapter {
    // 检测是否为微信小程序环境
    if (typeof (globalThis as any).wx !== 'undefined' && (globalThis as any).wx?.getStorage) {
      return new WxStorageAdapter()
    }
    // 检测是否为浏览器环境
    if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
      return new BrowserStorageAdapter()
    }
    return new BrowserStorageAdapter()
  }
}

/**
 * 分组存储的数据结构
 */
interface GroupedBreadcrumbData {
  [groupKey: string]: BreadcrumbPushData[]
}

/**
 * 用户行为栈存储类 - 按 type_subType 分组缓存并存储到本地
 */
export class Breadcrumb<O extends BaseOptionsType> {
  private readonly maxBreadcrumbs: number
  private readonly storageKey: string
  private readonly storage: StorageAdapter
  private groupedStack: GroupedBreadcrumbData

  constructor(options: Partial<O> = {}) {
    this.maxBreadcrumbs = options.maxBreadcrumbs || 10
    this.storageKey = 'FE_MONITOR'
    this.storage = StorageFactory.createStorage()
    this.groupedStack = {}
    this.initStorage()
  }

  /**
   * 初始化存储
   */
  private async initStorage(): Promise<void> {
    this.groupedStack = await this.loadFromStorage()
  }

  /**
   * 生成分组键
   */
  private generateGroupKey(type: string, subType?: string): string {
    return subType ? `${type}_${subType}` : type
  }

  /**
   * 解析分组键
   * @param groupKey 分组键，格式为 "type_subType" 或 "type"
   * @returns 解析后的类型和子类型
   */
  private parseGroupKey(groupKey: string): { type: string; subType?: string } {
    const firstUnderscoreIndex = groupKey.indexOf('_')
    if (firstUnderscoreIndex === -1) {
      return { type: groupKey }
    }

    const type = groupKey.substring(0, firstUnderscoreIndex)
    const subType = groupKey.substring(firstUnderscoreIndex + 1)
    return { type, subType }
  }

  /**
   * 生成存储键
   */
  private generateStorageKey(groupKey: string): string {
    return `${this.storageKey}_${groupKey}`
  }

  /**
   * 从存储中加载分组队列数据
   */
  private async loadFromStorage(): Promise<GroupedBreadcrumbData> {
    const result: GroupedBreadcrumbData = {}

    try {
      // 获取所有存储键
      const allKeys = await this.getAllStorageKeys()

      // 加载每个分组的数据
      for (const key of allKeys) {
        if (key.startsWith(this.storageKey + '_')) {
          const groupKey = key.replace(this.storageKey + '_', '')
          const data = await this.storage.get(key)
          if (data) {
            result[groupKey] = Array.isArray(data) ? data : []
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load breadcrumb data from storage:', error)
    }

    return result
  }

  /**
   * 获取所有存储键
   */
  private async getAllStorageKeys(): Promise<string[]> {
    try {
      // 微信小程序环境
      if (this.storage instanceof WxStorageAdapter) {
        return new Promise((resolve) => {
          ;(wx as any).getStorageInfo({
            success: (res: any) => {
              resolve(res.keys || [])
            },
            fail: () => {
              resolve([])
            }
          })
        })
      }

      // 浏览器环境
      if (this.storage instanceof BrowserStorageAdapter) {
        const keys: string[] = []
        for (let i = 0; i < (this.storage as any).storage.length; i++) {
          const key = (this.storage as any).storage.key(i)
          if (key && key.startsWith(this.storageKey + '_')) {
            keys.push(key)
          }
        }
        return keys
      }
    } catch (error) {
      console.warn('Failed to get storage keys:', error)
    }

    return []
  }

  /**
   * 保存分组队列数据到存储
   */
  private async saveGroupToStorage(groupKey: string, data: BreadcrumbPushData[]): Promise<void> {
    try {
      const storageKey = this.generateStorageKey(groupKey)
      await this.storage.set(storageKey, data)
    } catch (error) {
      console.warn('Failed to save breadcrumb data to storage:', error)
    }
  }

  /**
   * 删除分组存储
   */
  private async removeGroupFromStorage(groupKey: string): Promise<void> {
    try {
      const storageKey = this.generateStorageKey(groupKey)
      await this.storage.remove(storageKey)
    } catch (error) {
      console.warn('Failed to remove breadcrumb data from storage:', error)
    }
  }

  /**
   * 添加数据到指定分组队列
   */
  async push(data: BreadcrumbPushData): Promise<void> {
    if (!data || !data.type) return

    const groupKey = this.generateGroupKey(data.type, data.subType)

    // 初始化分组队列
    if (!this.groupedStack[groupKey]) {
      this.groupedStack[groupKey] = []
    }

    const breadcrumbData = {
      ...data
    }

    this.groupedStack[groupKey].push(breadcrumbData)

    // 保存到存储
    await this.saveGroupToStorage(groupKey, this.groupedStack[groupKey])
  }

  /**
   * 获取指定分组的所有数据
   */
  getStackByGroup(type: string, subType?: string): BreadcrumbPushData[] {
    const groupKey = this.generateGroupKey(type, subType)
    return [...(this.groupedStack[groupKey] || [])]
  }

  getAllGroupData(): Record<string, BreadcrumbPushData[]> {
    return this.groupedStack
  }

  /**
   * 清空指定分组
   */
  async clearGroup(type: string, subType?: string): Promise<void> {
    const groupKey = this.generateGroupKey(type, subType)
    delete this.groupedStack[groupKey]
    await this.removeGroupFromStorage(groupKey)
  }

  /**
   * 获取指定分组的队列长度
   */
  getGroupLength(type: string, subType?: string): number {
    const groupKey = this.generateGroupKey(type, subType)
    return this.groupedStack[groupKey]?.length || 0
  }

  /**
   * 检查指定分组是否已满
   */
  isGroupFull(type: string, subType?: string): boolean {
    return this.getGroupLength(type, subType) >= this.maxBreadcrumbs
  }

  /**
   * 根据分组键清空分组
   * @param groupKey 分组键
   */
  async clearGroupByKey(groupKey: string): Promise<void> {
    const { type, subType } = this.parseGroupKey(groupKey)
    await this.clearGroup(type, subType)
  }

  /**
   * 更新分组数据
   * @param type 数据类型
   * @param subType 数据子类型
   * @param updatedData 更新后的数据
   */
  async updateGroupData(
    type: string,
    subType?: string,
    updatedData?: BreadcrumbPushData[]
  ): Promise<void> {
    if (updatedData && updatedData.length > 0) {
      const groupKey = this.generateGroupKey(type, subType)
      // 直接更新内存中的分组数据
      this.groupedStack[groupKey] = [...updatedData]
      // 保存到存储
      await this.saveGroupToStorage(groupKey, this.groupedStack[groupKey])
    }
  }

  /**
   * 更新分组数据（通过分组键）
   * @param groupKey 分组键
   * @param updatedData 更新后的数据
   */
  async updateGroupDataByKey(groupKey: string, updatedData?: BreadcrumbPushData[]): Promise<void> {
    if (updatedData && updatedData.length > 0) {
      const { type, subType } = this.parseGroupKey(groupKey)
      await this.updateGroupData(type, subType, updatedData)
    }
  }
}
