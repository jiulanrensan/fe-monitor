import { Module } from '@nestjs/common'
import { ReportService } from './report.service'
import { ReportController } from './report.controller'
import { ClickHouseModule } from '../../../shared/src'
import { QueueCacheService } from './queue-cache.service'
import { QueueCacheController } from './queue-cache.controller'

@Module({
  imports: [ClickHouseModule],
  controllers: [ReportController, QueueCacheController],
  providers: [ReportService, QueueCacheService],
  exports: [ReportService]
})
export class ReportModule {}
