import {
  IsNumber,
  IsObject,
  ValidateNested,
  Min,
  IsOptional,
  IsString,
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

  @IsNumber()
  @Min(1, { message: '阈值必须大于等于1' })
  threshold: number;
}

/**
 * API 持续时间查询响应 DTO
 */
export class ApiDurationResponseDto {
  @IsString()
  url: string;

  @IsNumber()
  count: number;

  @IsNumber()
  median_duration: number;

  @IsNumber()
  p95_duration: number;

  @IsNumber()
  p99_duration: number;
}
