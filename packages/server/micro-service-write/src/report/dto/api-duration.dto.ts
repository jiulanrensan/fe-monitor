import { IsNumber, IsOptional, IsString, IsEnum } from 'class-validator'
import { APIDto } from './base.dto'
import { API_SUB_TYPE } from '../../../../shared/src'

/**
 * API 耗时上报 DTO
 */
export class ApiDurationReportDto extends APIDto {
  @IsNumber()
  duration: number

  @IsOptional()
  @IsNumber()
  queueTime?: number

  @IsOptional()
  @IsNumber()
  queueStart?: number

  @IsOptional()
  @IsNumber()
  queueEnd?: number

  @IsString()
  reqPage: string

  @IsString()
  resPage: string

  @IsString()
  network: string
}
