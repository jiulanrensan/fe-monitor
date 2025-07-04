import {
  Controller,
  Post,
  Get,
  Param,
  HttpException,
  HttpStatus,
  Logger,
  Body,
  Delete,
} from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { EventRegistry, MonitorEvent } from './event-registry';
import {
  RegisterEventDto,
  RemoveEventDto,
  CheckEventExistsDto,
  TriggerEventDto,
} from '../dto';

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
  async triggerMonitor(@Param() params: TriggerEventDto) {
    try {
      const { eventName } = params;
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
        `Trigger monitor ${params.eventName} failed: ${error.message}`,
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

  /**
   * 注册内置的监控事件
   */
  @Post('events/:eventName')
  async registerEvent(@Param() params: RegisterEventDto) {
    try {
      const { eventName } = params;
      this.logger.log(`Registering built-in monitor event: ${eventName}`);

      await this.schedulerService.registerMonitorEvent(eventName);

      return {
        success: true,
        message: `内置监控事件 ${eventName} 注册成功`,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Register event failed: ${error.message}`, error.stack);
      throw new HttpException(
        {
          success: false,
          message: `注册监控事件失败: ${error.message}`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * 移除监控事件
   */
  @Delete('events/:eventName')
  async removeEvent(@Param() params: RemoveEventDto) {
    try {
      const { eventName } = params;
      this.logger.log(`Removing monitor event: ${eventName}`);

      const removed = await this.schedulerService.removeMonitorEvent(eventName);

      if (!removed) {
        throw new Error(`事件 ${eventName} 不存在`);
      }

      return {
        success: true,
        message: `监控事件 ${eventName} 已移除`,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `Remove event ${params.eventName} failed: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        {
          success: false,
          message: `移除监控事件失败: ${error.message}`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * 检查监控事件是否存在
   */
  @Get('events/:eventName/exists')
  async checkEventExists(@Param() params: CheckEventExistsDto) {
    try {
      const { eventName } = params;
      const exists = await this.schedulerService.hasMonitorEvent(eventName);
      return {
        success: true,
        data: {
          eventName,
          exists,
        },
      };
    } catch (error) {
      this.logger.error(
        `Check event exists failed: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        {
          success: false,
          message: `检查事件存在性失败: ${error.message}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 获取所有内置监控事件列表
   */
  @Get('built-in-events')
  async getBuiltInEvents() {
    try {
      const events = await this.schedulerService.getBuiltInEvents();
      return {
        success: true,
        data: events,
        count: events.length,
      };
    } catch (error) {
      this.logger.error(
        `Get built-in events failed: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        {
          success: false,
          message: `获取内置事件列表失败: ${error.message}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
