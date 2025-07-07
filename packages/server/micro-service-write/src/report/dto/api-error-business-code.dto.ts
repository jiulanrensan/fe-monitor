import { IsNumber, IsString } from 'class-validator'
import { APIDto } from './base.dto'
import { ClickHouseTable } from 'shared/src'
import { API_ERROR_BUSINESS_CODE_TABLE } from '../../../../shared/src'

/**
 * API 错误业务码 DTO
 */
@ClickHouseTable(API_ERROR_BUSINESS_CODE_TABLE)
export class ApiErrorBusinessCodeReportDto extends APIDto {
  @IsNumber()
  errorCode: number

  @IsString()
  errorReason: string
}
