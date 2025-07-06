import { IsString, IsNumber, IsOptional, IsNotEmpty } from 'class-validator'

/**
 * 基本 DTO 类
 */
export class BaseDto {
  @IsString()
  @IsNotEmpty({ message: '应用ID不能为空' })
  aid: string

  @IsOptional()
  @IsString()
  sid?: string

  @IsOptional()
  @IsString()
  uid?: string

  @IsOptional()
  @IsString()
  logTime?: string

  @IsOptional()
  @IsString()
  reportTime?: string

  @IsOptional()
  @IsNumber()
  retryTimes?: number

  @IsOptional()
  @IsString()
  model?: string
}
