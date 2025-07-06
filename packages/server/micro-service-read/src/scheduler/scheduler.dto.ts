import { IsString, IsNotEmpty, IsOptional } from 'class-validator'

/**
 * 注册监控事件 DTO
 */
export class RegisterEventDto {
  @IsString()
  @IsNotEmpty({ message: '事件名称不能为空' })
  eventName: string
}

/**
 * 移除监控事件 DTO
 */
export class RemoveEventDto {
  @IsString()
  @IsNotEmpty({ message: '事件名称不能为空' })
  eventName: string
}

/**
 * 检查事件存在性 DTO
 */
export class CheckEventExistsDto {
  @IsString()
  @IsNotEmpty({ message: '事件名称不能为空' })
  eventName: string
}

/**
 * 触发监控事件 DTO
 */
export class TriggerEventDto {
  @IsString()
  @IsNotEmpty({ message: '事件名称不能为空' })
  eventName: string
}
