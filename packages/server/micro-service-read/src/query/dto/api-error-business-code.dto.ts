import { IsObject, ValidateNested, IsArray, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { APIDto, TimeRangeDto } from './base.dto';

/**
 * API 错误业务码查询 DTO
 */
export class ApiErrorBusinessCodeQueryDto extends APIDto {
  @IsObject()
  @ValidateNested()
  @Type(() => TimeRangeDto)
  timeRange: TimeRangeDto;

  @IsArray()
  @IsNumber({}, { each: true })
  errorCodes: number[];
}
