import { Logger, Module, OnApplicationBootstrap } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { DataService } from './data.service'
import { ClickHouseModule, ClickHouseHealthService } from '../../shared/src'
import { ReportModule } from './report/report.module'

@Module({
  imports: [ClickHouseModule, ReportModule],
  controllers: [AppController],
  providers: [AppService, DataService]
})
export class AppModule implements OnApplicationBootstrap {
  private readonly logger = new Logger(AppModule.name)

  constructor(private readonly healthService: ClickHouseHealthService) {}

  async onApplicationBootstrap() {
    // 检查 ClickHouse 连接状态
    const isConnected = await this.healthService.checkConnection()

    if (!isConnected) {
      this.logger.fatal('Fatal: ClickHouse connection verification failed. Application exiting.')
      process.exit(1)
    }

    this.logger.log('Application successfully connected to ClickHouse')
  }
}
