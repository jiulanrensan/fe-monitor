import { IsString, IsNumber, IsOptional, IsNotEmpty, IsEnum } from 'class-validator'

/**
 * 基本 DTO 类
 */
export class CommonDto {
  @IsString()
  @IsNotEmpty({ message: '项目ID不能为空' })
  pid: string

  @IsString()
  @IsNotEmpty({ message: '应用ID不能为空' })
  aid: string

  @IsString({ message: '' })
  sid: string

  @IsString({ message: '' })
  uid: string

  @IsNumber({}, { message: '' })
  reportTime: number

  @IsString({ message: '' })
  model: string

  @IsString({ message: '' })
  platform: string
}
