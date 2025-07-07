import { Controller, Post, Body, Logger } from '@nestjs/common'
import { ReportService } from './report.service'
import { PerformanceDto, ErrorDto, APIDto } from './dto'
import { BaseDto } from '../dto'
import { MONITOR_TYPE } from '../../../shared/src'
import { validate } from 'class-validator'

/**
 * 策略接口
 */
interface ReportStrategy {
  validate(data: any): Promise<boolean>
  handle(data: any): Promise<any>
}

/**
 * 抽象基类，提供通用的校验逻辑
 */
abstract class BaseReportStrategy<T> implements ReportStrategy {
  constructor(
    protected readonly reportService: ReportService,
    protected readonly logger: Logger,
    protected readonly dtoClass: new () => T
  ) {}

  async validate(data: any): Promise<boolean> {
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

  abstract handle(data: any): Promise<any>
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
        this.logger.warn(`不支持的监控类型: ${data.type}`)
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
      this.logger.error(`Report failed: ${error.message}`, error.stack)
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

  async handle(data: any): Promise<void> {
    await this.reportService.reportApi(data as APIDto)
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

  async handle(data: any): Promise<void> {
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

  async handle(data: any): Promise<void> {
    await this.reportService.reportError(data as ErrorDto)
  }

  getStrategyName(): string {
    return MONITOR_TYPE.ERROR
  }
}
