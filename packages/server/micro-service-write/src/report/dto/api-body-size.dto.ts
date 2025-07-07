import { IsNumber } from 'class-validator'
import { APIDto } from './base.dto'
import { ClickHouseTable } from 'shared/src'
import { API_BODY_SIZE_TABLE } from '../../../../shared/src'

/**
 * API Body 大小DTO
 */
@ClickHouseTable(API_BODY_SIZE_TABLE)
export class ApiBodySizeReportDto extends APIDto {
  @IsNumber()
  reqBodySize: number

  @IsNumber()
  resBodySize: number
}
