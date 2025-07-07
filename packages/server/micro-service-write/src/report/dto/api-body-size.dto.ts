import { IsNumber } from 'class-validator'
import { APIDto } from './base.dto'

/**
 * API Body 大小DTO
 */
export class ApiBodySizeReportDto extends APIDto {
  @IsNumber()
  reqBodySize: number

  @IsNumber()
  resBodySize: number
}
