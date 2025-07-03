import { IsString, IsOptional, IsNumber, IsNotEmpty } from 'class-validator';
import { BaseDto } from '../../dto';

/**
 * 时间范围 DTO
 */
export class TimeRangeDto {
  @IsString()
  @IsNotEmpty({ message: '开始时间不能为空' })
  start: string;

  @IsString()
  @IsNotEmpty({ message: '结束时间不能为空' })
  end: string;
}

/**
 * API 相关字段 DTO
 */
export class APIDto extends BaseDto {
  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsString()
  method?: string;

  @IsOptional()
  @IsNumber()
  statusCode?: number;
}
