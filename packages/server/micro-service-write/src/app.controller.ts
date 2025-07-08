import { Controller, Get } from '@nestjs/common'
import { AppService } from './app.service'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello()
  }

  /**
   * 健康检查
   */
  @Get('health')
  async health() {
    return {
      success: true,
      message: 'Write service is healthy',
      timestamp: new Date().toISOString()
    }
  }
}
