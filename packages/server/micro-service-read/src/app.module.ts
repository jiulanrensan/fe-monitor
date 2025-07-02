import { Logger, Module, OnApplicationBootstrap } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClickHouseModule } from './clickhouse/clickhouse.module';
import { ClickHouseHealthService } from './clickhouse/clickhouse-health.service';

@Module({
  imports: [ClickHouseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnApplicationBootstrap {
  private readonly logger = new Logger(AppModule.name);

  constructor(private readonly healthService: ClickHouseHealthService) {}

  async onApplicationBootstrap() {
    // 双重检查确保连接正常
    const isConnected = await this.healthService.checkConnection();

    if (!isConnected) {
      this.logger.fatal(
        'Fatal: ClickHouse connection verification failed. Application exiting.',
      );
      process.exit(1);
    }

    this.logger.log('Application successfully connected to ClickHouse');
  }
}
