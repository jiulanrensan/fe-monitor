import { Provider } from '@nestjs/common'
import { ClickHouseClient, createClient } from '@clickhouse/client'

export const CLICKHOUSE_CLIENT = 'CLICKHOUSE_CLIENT'

export interface ClickHouseConfig {
  host: string
  port: string
  username: string
  password: string
  database: string
  maxOpenConnections?: number
}

export const createClickHouseClient = (config?: Partial<ClickHouseConfig>): Provider => ({
  provide: CLICKHOUSE_CLIENT,
  useFactory: () => {
    const defaultConfig: ClickHouseConfig = {
      host: process.env.CLICKHOUSE_HOST || 'localhost',
      port: process.env.CLICKHOUSE_PORT || '8123',
      username: process.env.CLICKHOUSE_USER || 'default',
      password: process.env.CLICKHOUSE_PASSWORD || '',
      database: process.env.CLICKHOUSE_DB || 'default',
      maxOpenConnections: parseInt(process.env.CLICKHOUSE_MAX_CONNECTIONS || '50')
    }

    const finalConfig = { ...defaultConfig, ...config }

    return createClient({
      host: `${finalConfig.host}:${finalConfig.port}`,
      username: finalConfig.username,
      password: finalConfig.password,
      database: finalConfig.database,
      max_open_connections: finalConfig.maxOpenConnections
    })
  }
})
