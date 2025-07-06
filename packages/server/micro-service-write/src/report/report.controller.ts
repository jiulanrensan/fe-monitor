import { Controller, Post, Body, HttpException, HttpStatus, Logger } from '@nestjs/common'
import { ReportService } from './report.service'
import { PerformanceDto, ErrorDto, APIDto } from './dto'

@Controller('report')
export class ReportController {
  private readonly logger = new Logger(ReportController.name)

  constructor(private readonly reportService: ReportService) {}

  /**
   * 上报API监控数据
   */
  @Post()
  async reportApi(@Body() data: APIDto) {
    try {
      // 入参校验
      if (!data.aid) {
        throw new HttpException(
          {
            success: false,
            message: '应用ID不能为空'
          },
          HttpStatus.BAD_REQUEST
        )
      }

      if (data.url && typeof data.url !== 'string') {
        throw new HttpException(
          {
            success: false,
            message: 'URL必须是字符串类型'
          },
          HttpStatus.BAD_REQUEST
        )
      }

      if (data.method && typeof data.method !== 'string') {
        throw new HttpException(
          {
            success: false,
            message: '请求方法必须是字符串类型'
          },
          HttpStatus.BAD_REQUEST
        )
      }

      if (
        data.statusCode &&
        (typeof data.statusCode !== 'number' || data.statusCode < 100 || data.statusCode > 599)
      ) {
        throw new HttpException(
          {
            success: false,
            message: '状态码必须是100-599之间的数字'
          },
          HttpStatus.BAD_REQUEST
        )
      }

      this.logger.log(`Received API report for app: ${data.aid}`)
      await this.reportService.reportApi(data)

      return {
        success: true,
        message: 'API数据上报成功',
        data: { aid: data.aid }
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      this.logger.error(`API report failed: ${error.message}`, error.stack)
      throw new HttpException(
        {
          success: false,
          message: `API数据上报失败: ${error.message}`
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }
}
