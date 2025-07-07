import { extractFieldsFromDto } from './dto-extractor.util'
import { getClickHouseTable } from '../decorators/clickhouse-table.decorator'

/**
 * 通用的字段提取方法 - 从 DTO 类定义中自动提取字段
 * @param data 原始数据对象
 * @param dtoClass DTO 类
 * @returns 包含提取的字段和表名的对象
 */
export function extractDataFromDto<T extends Record<string, any>>(
  data: any,
  dtoClass: new (...args: any[]) => T
): { extractedData: Record<string, any>; tableName: string | undefined } {
  // 通过 DTO 类自动提取字段
  const extractedData = extractFieldsFromDto(data, dtoClass)
  const tableName = getClickHouseTable(dtoClass)

  return { extractedData, tableName }
}
