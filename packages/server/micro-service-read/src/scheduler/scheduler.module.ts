import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { SchedulerService } from './scheduler.service'
import { SchedulerController } from './scheduler.controller'
import { EventRegistry } from './event-registry'
import { AlertService } from './alert.service'
import { QueryModule } from '../query/query.module'

@Module({
  imports: [ScheduleModule.forRoot(), QueryModule],
  controllers: [SchedulerController],
  providers: [SchedulerService, EventRegistry, AlertService],
  exports: [EventRegistry, AlertService]
})
export class SchedulerModule {}
