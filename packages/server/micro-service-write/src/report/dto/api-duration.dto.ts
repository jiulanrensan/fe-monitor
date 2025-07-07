import { IsNumber, IsOptional, IsString } from 'class-validator'

import { APIDto } from './base.dto'

/**
 * API 耗时上报 DTO
 */
export class ApiDurationReportDto extends APIDto {
  @IsNumber()
  duration: number

  @IsOptional()
  @IsNumber()
  queueTime: number

  @IsNumber()
  queue_start: number

  @IsNumber()
  queue_end: number

  @IsString()
  req_page: string

  @IsString()
  res_page: string

  @IsString()
  network: string
}
