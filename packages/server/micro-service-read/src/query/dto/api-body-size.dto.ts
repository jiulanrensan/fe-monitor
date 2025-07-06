import { IsNumber, IsObject, ValidateNested, Min, IsString } from 'class-validator'
import { Type } from 'class-transformer'
import { APIDto, TimeRangeDto } from './base.dto'

/**
 * API Body 大小查询 DTO
 * 请求体size>=reqBodySize 或 响应体size>=resBodySize
 */
export class ApiBodySizeQueryDto extends APIDto {
  @IsObject()
  @ValidateNested()
  @Type(() => TimeRangeDto)
  timeRange: TimeRangeDto

  @IsNumber()
  @Min(0, { message: '请求体大小必须大于等于0' })
  reqBodySize: number

  @IsNumber()
  @Min(0, { message: '响应体大小必须大于等于0' })
  resBodySize: number

  @IsNumber()
  @Min(1, { message: '阈值必须大于等于1' })
  threshold: number
}

/**
 * API Body Size 查询响应 DTO
 */
export class ApiBodySizeResponseDto {
  @IsString()
  url: string

  @IsNumber()
  count: number

  @IsNumber()
  median_req_body_size: number

  @IsNumber()
  median_res_body_size: number
}
