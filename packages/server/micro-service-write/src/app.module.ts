import { Logger, Module, OnApplicationBootstrap } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { DataService } from './data.service'
import {
  ClickHouseModule,
  ClickHouseHealthService,
  GracefulShutdownService
} from '../../shared/src'
import { ReportModule } from './report/report.module'

@Module({
  imports: [ClickHouseModule, ReportModule],
  controllers: [AppController],
  providers: [AppService, DataService, GracefulShutdownService]
})
export class AppModule implements OnApplicationBootstrap {
  private readonly logger = new Logger(AppModule.name)

  constructor(
    private readonly healthService: ClickHouseHealthService,
    private readonly gracefulShutdownService: GracefulShutdownService
  ) {}

  async onApplicationBootstrap() {
    // 检查 ClickHouse 连接状态
    const isConnected = await this.healthService.checkConnection()

    if (!isConnected) {
      this.logger.fatal('Fatal: ClickHouse connection verification failed. Application exiting.')
      process.exit(1)
    }

    // 注册信号处理器，用于优雅关闭
    this.gracefulShutdownService.registerSignalHandlers()

    this.logger.log('Application successfully connected to ClickHouse')
    this.logger.log('Graceful shutdown handlers registered')
  }
}
