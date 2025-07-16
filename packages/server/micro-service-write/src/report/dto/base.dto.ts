import { IsString, IsOptional, IsNumber, IsNotEmpty, IsDateString } from 'class-validator'
import { BaseDto } from '../../dto'

/**
 * API 相关字段 DTO
 */
export class APIDto extends BaseDto {
  @IsString()
  url: string

  @IsString()
  method: string

  @IsNumber()
  statusCode: number
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

export class FreLogDto extends BaseDto {
  @IsOptional()
  @IsString()
  logType?: string

  @IsString()
  logContent: string

  @IsOptional()
  @IsString()
  logKeywords?: string
}
