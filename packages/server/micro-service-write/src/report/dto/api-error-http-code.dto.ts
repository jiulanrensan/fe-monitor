import { IsString } from 'class-validator'
import { APIDto } from './base.dto'

/**
 * API 错误HTTP状态码 DTO
 */
export class ApiErrorHttpCodeReportDto extends APIDto {
  @IsString()
  error_reason: string
}
