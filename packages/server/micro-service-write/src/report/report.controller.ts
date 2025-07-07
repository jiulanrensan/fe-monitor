import { Controller, Post, Body, Logger } from '@nestjs/common'
import { ReportService } from './report.service'
import {
  PerformanceDto,
  ErrorDto,
  APIDto,
  ApiDurationReportDto,
  ApiErrorBusinessCodeReportDto,
  ApiErrorHttpCodeReportDto,
  ApiBodySizeReportDto
} from './dto'
import { BaseDto } from '../dto'
import { MONITOR_TYPE, API_SUB_TYPE } from '../../../shared/src'
import { validate } from 'class-validator'

/**
 * 策略接口
 */
interface ReportStrategy {
  validate(data: any): Promise<boolean>
  handle(data: any): Promise<any>
}

/**
 * 子类型配置接口
 */
interface SubTypeConfig {
  name: string
  dtoClass: any
  serviceMethod: (data: any) => Promise<void>
}

/**
 * 抽象基类，提供通用的校验逻辑和子类型处理
 */
abstract class BaseReportStrategy<T> implements ReportStrategy {
  constructor(
    protected readonly reportService: ReportService,
    protected readonly logger: Logger,
    protected readonly dtoClass: new () => T
  ) {}

  async validate(data: any): Promise<boolean> {
    // 检查是否支持子类型
    const subTypeConfig = this.detectSubType(data)
    if (subTypeConfig) {
      // 使用子类型进行校验
      return this.validateWithSubType(data, subTypeConfig)
    } else {
      // 使用基础类型进行校验
      return this.validateWithBaseType(data)
    }
  }

  private async validateWithSubType(data: any, subTypeConfig: SubTypeConfig): Promise<boolean> {
    try {
      // 将数据转换为对应的子类型 DTO 实例
      const dtoInstance = Object.assign(new subTypeConfig.dtoClass(), data)
      const errors = await validate(dtoInstance)

      if (errors.length > 0) {
        const errorMessages = errors
          .map((error) => `${error.property}: ${Object.values(error.constraints || {}).join(', ')}`)
          .join('; ')
        this.logger.error(
          `${this.getStrategyName()}数据校验失败 (${subTypeConfig.name}): ${errorMessages}`
        )
        return false
      }
      return true
    } catch (error) {
      this.logger.error(
        `${this.getStrategyName()}数据校验异常 (${subTypeConfig.name}): ${error.message}`
      )
      return false
    }
  }

  private async validateWithBaseType(data: any): Promise<boolean> {
    try {
      // 将数据转换为对应的 DTO 实例
      const dtoInstance = Object.assign(new this.dtoClass() as any, data)
      const errors = await validate(dtoInstance)

      if (errors.length > 0) {
        const errorMessages = errors
          .map((error) => `${error.property}: ${Object.values(error.constraints || {}).join(', ')}`)
          .join('; ')
        this.logger.error(`${this.getStrategyName()}数据校验失败: ${errorMessages}`)
        return false
      }
      return true
    } catch (error) {
      this.logger.error(`${this.getStrategyName()}数据校验异常: ${error.message}`)
      return false
    }
  }

  async handle(data: any): Promise<any> {
    // 检查是否支持子类型
    const subTypeConfig = this.detectSubType(data)

    if (subTypeConfig) {
      // 使用子类型进行处理
      return this.handleWithSubType(data, subTypeConfig)
    } else {
      // 使用基础类型进行处理
      return this.handleWithBaseType(data)
    }
  }

  private async handleWithSubType(data: any, subTypeConfig: SubTypeConfig): Promise<void> {
    await subTypeConfig.serviceMethod.call(this.reportService, data)
  }

  protected async handleWithBaseType(data: any): Promise<void> {
    // 子类可以重写此方法
    throw new Error(`${this.getStrategyName()} 需要实现 handleWithBaseType 方法或提供子类型配置`)
  }

  /**
   * 检测子类型，子类需重写此方法
   * @param data 上报数据
   * @returns 子类型配置或 null
   */
  protected detectSubType(data: any): SubTypeConfig | null {
    throw new Error(`${this.getStrategyName()} 需要实现 detectSubType 方法`)
  }

  abstract getStrategyName(): string
}

const SUCCESS_RESPONSE = {
  succ: true
  //   message: '数据上报成功'
}

@Controller('report')
export class ReportController {
  private readonly logger = new Logger(ReportController.name)
  private readonly strategies: Map<MONITOR_TYPE, ReportStrategy>

  constructor(private readonly reportService: ReportService) {
    // 初始化策略映射
    this.strategies = new Map()

    const strategyConfigs = [
      { type: MONITOR_TYPE.API, strategy: ApiReportStrategy },
      { type: MONITOR_TYPE.PERFORMANCE, strategy: PerformanceReportStrategy },
      { type: MONITOR_TYPE.ERROR, strategy: ErrorReportStrategy }
    ]

    strategyConfigs.forEach(({ type, strategy }) => {
      this.strategies.set(type, new strategy(this.reportService, this.logger))
    })
  }

  /**
   * 上报监控数据
   */
  @Post()
  async report(@Body() data: BaseDto) {
    try {
      const strategy = this.strategies.get(data.type)

      if (!strategy) {
        this.logger.error(`不支持的监控类型: ${data.type}`)
        return SUCCESS_RESPONSE
      }

      // 执行校验
      if (!(await strategy.validate(data))) {
        return SUCCESS_RESPONSE
      }

      // 执行处理
      await strategy.handle(data)

      return SUCCESS_RESPONSE
    } catch (error) {
      this.logger.error(`上报监控数据失败: ${error.message}`, error.stack)
      return SUCCESS_RESPONSE
    }
  }
}

/**
 * API监控数据上报策略
 */
class ApiReportStrategy extends BaseReportStrategy<APIDto> {
  constructor(reportService: ReportService, logger: Logger) {
    super(reportService, logger, APIDto)
  }

  /**
   * 根据 API_SUB_TYPE 判断子类型
   */
  protected detectSubType(data: any): SubTypeConfig | null {
    // 根据 API_SUB_TYPE 判断子类型
    const subTypeMap = {
      [API_SUB_TYPE.DURATION]: {
        name: API_SUB_TYPE.DURATION,
        dtoClass: ApiDurationReportDto,
        serviceMethod: this.reportService.reportApiDuration
      },
      [API_SUB_TYPE.BODY_SIZE]: {
        name: API_SUB_TYPE.BODY_SIZE,
        dtoClass: ApiBodySizeReportDto,
        serviceMethod: this.reportService.reportApiBodySize
      },
      [API_SUB_TYPE.ERROR_HTTP_CODE]: {
        name: API_SUB_TYPE.ERROR_HTTP_CODE,
        dtoClass: ApiErrorHttpCodeReportDto,
        serviceMethod: this.reportService.reportApiErrorHttpCode
      },
      [API_SUB_TYPE.ERROR_BUSINESS_CODE]: {
        name: API_SUB_TYPE.ERROR_BUSINESS_CODE,
        dtoClass: ApiErrorBusinessCodeReportDto,
        serviceMethod: this.reportService.reportApiErrorBusinessCode
      }
    }

    // 从数据中获取子类型
    const subType = data.subType
    if (subType && subTypeMap[subType]) {
      return subTypeMap[subType]
    }

    // 如果没有匹配的子类型
    this.logger.warn(`无法识别的API子类型: ${subType}`)
    return null
  }

  getStrategyName(): string {
    return MONITOR_TYPE.API
  }
}

/**
 * 性能监控数据上报策略
 */
class PerformanceReportStrategy extends BaseReportStrategy<PerformanceDto> {
  constructor(reportService: ReportService, logger: Logger) {
    super(reportService, logger, PerformanceDto)
  }

  /**
   * 后续再拓展
   */
  protected detectSubType(data: any): SubTypeConfig | null {
    return null
  }

  protected async handleWithBaseType(data: any): Promise<void> {
    await this.reportService.reportPerformance(data as PerformanceDto)
  }

  getStrategyName(): string {
    return MONITOR_TYPE.PERFORMANCE
  }
}

/**
 * 错误监控数据上报策略
 */
class ErrorReportStrategy extends BaseReportStrategy<ErrorDto> {
  constructor(reportService: ReportService, logger: Logger) {
    super(reportService, logger, ErrorDto)
  }
  /**
   * 后续再拓展
   */
  protected detectSubType(data: any): SubTypeConfig | null {
    return null
  }

  protected async handleWithBaseType(data: any): Promise<void> {
    await this.reportService.reportError(data as ErrorDto)
  }

  getStrategyName(): string {
    return MONITOR_TYPE.ERROR
  }
}
