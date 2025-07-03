import { IsNumber, IsObject, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { APIDto, TimeRangeDto } from './base.dto';

/**
 * API Body 大小查询 DTO
 * 请求体size>=reqBodySize 或 响应体size>=resBodySize
 */
export class ApiBodySizeQueryDto extends APIDto {
  @IsObject()
  @ValidateNested()
  @Type(() => TimeRangeDto)
  timeRange: TimeRangeDto;

  @IsNumber()
  @Min(0, { message: '请求体大小必须大于等于0' })
  reqBodySize: number;

  @IsNumber()
  @Min(0, { message: '响应体大小必须大于等于0' })
  resBodySize: number;
}
