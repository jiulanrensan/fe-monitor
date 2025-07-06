import { IsNumber, IsObject, ValidateNested, Min, IsOptional, IsString } from 'class-validator'
import { Type } from 'class-transformer'
import { APIDto, TimeRangeDto } from './base.dto'

/**
 * API 错误HTTP状态码查询 DTO
 */
export class ApiErrorHttpCodeQueryDto extends APIDto {
  @IsObject()
  @ValidateNested()
  @Type(() => TimeRangeDto)
  timeRange: TimeRangeDto

  /**
   * APIDto已经定义了statusCode字段，这里需要重新定义
   */
  @IsNumber()
  @Min(400, { message: 'HTTP状态码必须大于等于400' })
  declare statusCode: number

  /**
   * 是否使用大于等于，默认true
   */
  @IsOptional()
  useGreaterEqual?: boolean = true

  @IsNumber()
  @Min(1, { message: '阈值必须大于等于1' })
  threshold: number
}

/**
 * API 错误 HTTP 状态码查询响应 DTO
 */
export class ApiErrorHttpCodeResponseDto {
  @IsString()
  url: string

  @IsNumber()
  count: number

  @IsNumber()
  status_code?: number
}
