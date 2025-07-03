import {
  Controller,
  Post,
  Get,
  Param,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { EventRegistry } from './event-registry';

@Controller('scheduler')
export class SchedulerController {
  private readonly logger = new Logger(SchedulerController.name);

  constructor(
    private readonly schedulerService: SchedulerService,
    private readonly eventRegistry: EventRegistry,
  ) {}

  /**
   * 手动触发所有监控事件
   */
  @Post('trigger-all')
  async triggerAllMonitors() {
    try {
      this.logger.log('Manually triggering all monitors...');
      await this.schedulerService.triggerAllMonitors();
      return {
        success: true,
        message: '所有监控事件已触发',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `Trigger all monitors failed: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        {
          success: false,
          message: `触发所有监控事件失败: ${error.message}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 手动触发指定监控事件
   */
  @Post('trigger/:eventName')
  async triggerMonitor(@Param('eventName') eventName: string) {
    try {
      this.logger.log(`Manually triggering monitor: ${eventName}`);
      const result = await this.schedulerService.triggerMonitor(eventName);
      return {
        success: true,
        message: `监控事件 ${eventName} 已触发`,
        data: result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `Trigger monitor ${eventName} failed: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        {
          success: false,
          message: `触发监控事件失败: ${error.message}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 获取所有注册的监控事件
   */
  @Get('events')
  async getRegisteredEvents() {
    try {
      const events = this.eventRegistry.getAllEvents();
      return {
        success: true,
        data: events.map((event) => ({
          name: event.name,
          description: event.description,
        })),
        count: events.length,
      };
    } catch (error) {
      this.logger.error(
        `Get registered events failed: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        {
          success: false,
          message: `获取注册事件失败: ${error.message}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
