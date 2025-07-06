import { IsString, IsOptional, IsObject, ValidateNested, IsNotEmpty } from 'class-validator'
import { Type } from 'class-transformer'
import { APIDto, TimeRangeDto } from './base.dto'

/**
 * 聚合查询 DTO
 */
export class AggregationQueryDto extends APIDto {
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => TimeRangeDto)
  timeRange?: TimeRangeDto

  @IsString()
  @IsNotEmpty({ message: '表名不能为空' })
  tableName: string

  @IsString()
  @IsNotEmpty({ message: '聚合函数不能为空' })
  aggregation: string

  @IsOptional()
  @IsString()
  groupBy?: string

  @IsOptional()
  @IsString()
  where?: string
}
