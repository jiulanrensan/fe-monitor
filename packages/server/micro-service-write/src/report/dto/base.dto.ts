import { IsString, IsOptional, IsNumber, IsNotEmpty, IsDateString } from 'class-validator'
import { BaseDto } from '../../dto'

/**
 * API 相关字段 DTO
 */
export class APIDto extends BaseDto {
  @IsOptional()
  @IsString()
  url?: string

  @IsOptional()
  @IsString()
  method?: string

  @IsOptional()
  @IsNumber()
  statusCode?: number
}

/**
 * 性能监控数据 DTO
 */
export class PerformanceDto extends BaseDto {
  @IsNumber()
  @IsOptional()
  duration?: number

  @IsNumber()
  @IsOptional()
  bodySize?: number
}

/**
 * 错误监控数据 DTO
 */
export class ErrorDto extends BaseDto {
  @IsString()
  @IsOptional()
  errorMessage?: string

  @IsString()
  @IsOptional()
  errorCode?: string

  @IsString()
  @IsOptional()
  errorStack?: string
}
