import { IsNumber, IsOptional, IsString, IsEnum } from 'class-validator'
import { APIDto } from './base.dto'
import { ClickHouseTable } from 'shared/src'
import { API_SUB_TYPE, API_DURATION_TABLE } from '../../../../shared/src'

/**
 * API 耗时上报 DTO
 */
@ClickHouseTable(API_DURATION_TABLE)
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
