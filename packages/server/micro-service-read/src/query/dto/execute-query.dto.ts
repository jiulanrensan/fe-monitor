import {
  IsString,
  IsOptional,
  IsObject,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { APIDto, TimeRangeDto } from './base.dto';

/**
 * 执行查询 DTO
 */
export class ExecuteQueryDto extends APIDto {
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => TimeRangeDto)
  timeRange?: TimeRangeDto;

  @IsString()
  @IsNotEmpty({ message: '查询语句不能为空' })
  query: string;
}
