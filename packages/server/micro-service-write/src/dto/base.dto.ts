import { IsString, IsNumber, IsOptional, IsNotEmpty, IsEnum, isEnum } from 'class-validator'
import { API_SUB_TYPE, MONITOR_TYPE } from 'shared/src'

/**
 * 基本 DTO 类
 */
export class BaseDto {
  @IsString()
  @IsNotEmpty({ message: '应用ID不能为空' })
  aid: string

  @IsString({ message: '' })
  sid: string

  @IsString({ message: '' })
  uid: string

  @IsString({ message: '' })
  logTime: string

  @IsString({ message: '' })
  reportTime: string

  @IsNumber({}, { message: '' })
  retryTimes: number

  @IsString({ message: '' })
  model: string

  @IsEnum(MONITOR_TYPE, { message: '类型错误' })
  type: MONITOR_TYPE

  @IsOptional()
  @IsEnum(API_SUB_TYPE, { message: '类型错误' })
  subType?: API_SUB_TYPE
}
