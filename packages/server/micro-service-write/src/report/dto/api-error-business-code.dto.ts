import { IsNumber, IsString } from 'class-validator'
import { APIDto } from './base.dto'

/**
 * API 错误业务码 DTO
 */
export class ApiErrorBusinessCodeReportDto extends APIDto {
  @IsNumber()
  errorCode: number

  @IsString()
  errorReason: string
}
