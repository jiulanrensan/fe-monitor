import {
  IsString,
  IsOptional,
  IsNumber,
  IsNotEmpty,
  IsDateString,
  ValidateNested,
  IsArray,
  IsEnum
} from 'class-validator'
import { CommonDto } from '../../dto'
import { Type } from 'class-transformer'
import { API_SUB_TYPE, MONITOR_TYPE } from 'shared/src'

class ReportCommonDto {
  @IsEnum(MONITOR_TYPE, { message: '类型错误' })
  type: MONITOR_TYPE

  @IsOptional()
  @IsEnum(API_SUB_TYPE, { message: '类型错误' })
  subType?: API_SUB_TYPE

  @IsNumber({}, { message: '' })
  logTime: number

  @IsOptional()
  @IsNumber({}, { message: '' })
  retryTimes?: number
}
/**
 * 上报数据 DTO
 */
export class ReportDto extends CommonDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReportCommonDto)
  list: ReportCommonDto[]
}

export class BaseDto extends CommonDto {
  @IsEnum(MONITOR_TYPE, { message: '类型错误' })
  type: MONITOR_TYPE

  @IsOptional()
  @IsEnum(API_SUB_TYPE, { message: '类型错误' })
  subType?: API_SUB_TYPE

  @IsNumber({}, { message: '' })
  logTime: number
}
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
