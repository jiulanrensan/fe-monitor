import { IsEnum, IsNumber, IsString } from 'class-validator'
import { FreLogDto } from './base.dto'
import { ClickHouseTable } from 'shared/src'
import { FRE_LOG_TABLE } from '../../../../shared/src'

/**
 * API 错误业务码 DTO
 */
@ClickHouseTable(FRE_LOG_TABLE)
export class FreLogReportDto extends FreLogDto {}
