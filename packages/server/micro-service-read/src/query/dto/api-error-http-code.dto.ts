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
 * API 错误HTTP状态码查询 DTO
 */
export class ApiErrorHttpCodeQueryDto extends APIDto {
  @IsObject()
  @ValidateNested()
  @Type(() => TimeRangeDto)
  timeRange: TimeRangeDto;

  /**
   * APIDto已经定义了statusCode字段，这里需要重新定义
   */
  @IsNumber()
  @Min(400, { message: 'HTTP状态码必须大于等于400' })
  declare statusCode: number;

  @IsOptional()
  useGreaterEqual?: boolean = true;
}
