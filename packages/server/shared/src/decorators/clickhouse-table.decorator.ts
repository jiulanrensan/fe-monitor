import 'reflect-metadata'

const CLICKHOUSE_TABLE_KEY = 'clickhouse:table'

/**
 * 装饰器：标记 DTO 类对应的 ClickHouse 表名
 * @param tableName ClickHouse 表名
 */
export function ClickHouseTable(tableName: string) {
  return function (target: any) {
    Reflect.defineMetadata(CLICKHOUSE_TABLE_KEY, tableName, target)
  }
}

/**
 * 获取 DTO 类对应的 ClickHouse 表名
 * @param dtoClass DTO 类
 * @returns ClickHouse 表名
 */
export function getClickHouseTable(dtoClass: any): string | undefined {
  return Reflect.getMetadata(CLICKHOUSE_TABLE_KEY, dtoClass)
}
