import { IsObject, ValidateNested, IsArray, IsNumber, Min, IsString } from 'class-validator'
import { Type } from 'class-transformer'
import { APIDto, TimeRangeDto } from './base.dto'

/**
 * API 错误业务码查询 DTO
 */
export class ApiErrorBusinessCodeQueryDto extends APIDto {
  @IsObject()
  @ValidateNested()
  @Type(() => TimeRangeDto)
  timeRange: TimeRangeDto

  @IsArray()
  @IsNumber({}, { each: true })
  errorCodes: number[]

  @IsNumber()
  @Min(1, { message: '阈值必须大于等于1' })
  threshold: number
}

/**
 * API 业务错误码查询响应 DTO
 */
export class ApiErrorBusinessCodeResponseDto {
  @IsString()
  url: string

  @IsNumber()
  count: number

  @IsNumber()
  error_code?: number
}
