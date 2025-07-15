import { IsString } from 'class-validator'
import { APIDto } from './base.dto'
import { ClickHouseTable } from 'shared/src'
import { API_ERROR_HTTP_CODE_TABLE } from '../../../../shared/src'

/**
 * API 错误HTTP状态码 DTO
 */
@ClickHouseTable(API_ERROR_HTTP_CODE_TABLE)
export class ApiErrorHttpCodeReportDto extends APIDto {
  @IsString()
  errorReason: string
}
