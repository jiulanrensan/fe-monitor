import * as dotenv from 'dotenv'
import * as path from 'path'

/**
 * 环境配置加载器
 */
export class EnvLoader {
  private static instance: EnvLoader
  private loaded = false

  private constructor() {}

  static getInstance(): EnvLoader {
    if (!EnvLoader.instance) {
      EnvLoader.instance = new EnvLoader()
    }
    return EnvLoader.instance
  }

  /**
   * 加载环境配置
   * @param env 环境名称 (development, production, test, staging)
   */
  load(env?: string): void {
    if (this.loaded) {
      return
    }

    const environment = env || process.env.NODE_ENV || 'development'

    // 尝试多个可能的配置文件路径
    const possiblePaths = [
      // 相对于当前工作目录
      path.resolve(process.cwd(), 'config', `${environment}.env`)
      // 微服务目录下的配置
      // path.resolve(process.cwd(), '..', 'config', `${environment}.env`)
    ]

    console.log(`Loading environment config: ${environment}`)
    console.log(`Possible config paths:`, possiblePaths)

    let configLoaded = false
    let loadedPath = ''

    // 尝试加载配置文件
    for (const configPath of possiblePaths) {
      const result = dotenv.config({ path: configPath })
      console.log(`Trying path: ${configPath}`, result.error ? 'Failed' : 'Success')

      if (!result.error) {
        configLoaded = true
        loadedPath = configPath
        console.log(`Environment config loaded successfully: ${configPath}`)
        break
      }
    }

    if (!configLoaded) {
      console.warn('Failed to load any config file, using default environment variables')
      console.warn('Tried paths:', possiblePaths)
    }

    // 设置默认环境变量
    this.setDefaults()

    this.loaded = true
  }

  /**
   * 设置默认环境变量
   */
  private setDefaults(): void {
    // console.log('setDefaults', process.env.CLICKHOUSE_HOST)
    // console.log('setDefaults', process.env.CLICKHOUSE_PORT)
    // console.log('setDefaults', process.env.CLICKHOUSE_USER)
    // console.log('setDefaults', process.env.CLICKHOUSE_PASSWORD)
    // console.log('setDefaults', process.env.CLICKHOUSE_DB)
    // console.log('setDefaults', process.env.READ_SERVICE_PORT)
    // console.log('setDefaults', process.env.WRITE_SERVICE_PORT)
    // console.log('setDefaults', process.env.NODE_ENV)

    // ClickHouse 默认配置
    process.env.CLICKHOUSE_HOST = process.env.CLICKHOUSE_HOST || 'http://127.0.0.1'
    process.env.CLICKHOUSE_PORT = process.env.CLICKHOUSE_PORT || '8123'
    process.env.CLICKHOUSE_USER = process.env.CLICKHOUSE_USER || 'default'
    process.env.CLICKHOUSE_PASSWORD = process.env.CLICKHOUSE_PASSWORD || ''
    process.env.CLICKHOUSE_DB = process.env.CLICKHOUSE_DB || 'fe_monitor'
    process.env.CLICKHOUSE_MAX_CONNECTIONS = process.env.CLICKHOUSE_MAX_CONNECTIONS || '10'

    // 服务端口默认配置
    process.env.READ_SERVICE_PORT = process.env.READ_SERVICE_PORT || '3000'
    process.env.WRITE_SERVICE_PORT = process.env.WRITE_SERVICE_PORT || '3001'

    // 其他默认配置
    process.env.NODE_ENV = process.env.NODE_ENV || 'development'
  }

  /**
   * 获取环境变量
   * @param key 环境变量键名
   * @param defaultValue 默认值
   */
  get(key: string, defaultValue?: string): string | undefined {
    return process.env[key] || defaultValue
  }

  /**
   * 获取数字类型的环境变量
   * @param key 环境变量键名
   * @param defaultValue 默认值
   */
  getNumber(key: string, defaultValue: number): number {
    const value = process.env[key]
    return value ? parseInt(value, 10) : defaultValue
  }

  /**
   * 获取布尔类型的环境变量
   * @param key 环境变量键名
   * @param defaultValue 默认值
   */
  getBoolean(key: string, defaultValue: boolean): boolean {
    const value = process.env[key]
    if (value === undefined) return defaultValue
    return value.toLowerCase() === 'true'
  }
}

// 导出单例实例
export const envLoader = EnvLoader.getInstance()
