import {
  IsNumber,
  IsObject,
  ValidateNested,
  Min,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { APIDto, TimeRangeDto } from './base.dto';

/**
 * API 持续时间查询 DTO
 */
export class ApiDurationQueryDto extends APIDto {
  @IsObject()
  @ValidateNested()
  @Type(() => TimeRangeDto)
  timeRange: TimeRangeDto;

  @IsNumber()
  @Min(0, { message: '请求总耗时必须大于等于0' })
  duration: number;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: '排队时间必须大于等于0' })
  queueTime: number;
}
