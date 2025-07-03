import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { EventRegistry, MonitorEvent } from './event-registry';
import { AlertService } from './alert.service';
import { QueryService } from '../query/query.service';
import { defaultMonitorConfig } from './monitor.config';

@Injectable()
export class SchedulerService implements OnModuleInit {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly eventRegistry: EventRegistry,
    private readonly alertService: AlertService,
    private readonly queryService: QueryService,
  ) {}

  async onModuleInit() {
    this.registerMonitorEvents();
  }

  /**
   * 监控事件配置
   */
  private readonly monitorEvents = [
    {
      name: 'api-duration-monitor',
      description: '监控API请求耗时异常',
      handler: () => this.monitorApiDuration(),
    },
    {
      name: 'api-body-size-monitor',
      description: '监控API请求体大小异常',
      handler: () => this.monitorApiBodySize(),
    },
    {
      name: 'api-error-http-code-monitor',
      description: '监控API错误HTTP状态码',
      handler: () => this.monitorApiErrorHttpCode(),
    },
    {
      name: 'api-error-business-code-monitor',
      description: '监控API错误业务码',
      handler: () => this.monitorApiErrorBusinessCode(),
    },
  ];

  /**
   * 注册所有监控事件
   */
  private registerMonitorEvents(): void {
    this.monitorEvents.forEach((event) => {
      this.eventRegistry.registerEvent(event);
    });

    this.logger.log(
      `All ${this.monitorEvents.length} monitor events registered successfully`,
    );
  }

  /**
   * 获取监控时间范围
   */
  private getMonitorTimeRange(): { start: string; end: string } {
    const now = new Date();
    const timeRangeMinutes = defaultMonitorConfig.scheduler.timeRangeMinutes;
    const timeRangeStart = new Date(
      now.getTime() - timeRangeMinutes * 60 * 1000,
    );

    // 格式化为 ClickHouse 兼容的 DateTime 格式: 'YYYY-MM-DD HH:mm:ss'
    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');

      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    return {
      start: formatDate(timeRangeStart),
      end: formatDate(now),
    };
  }

  /**
   * 定时任务：每10分钟执行一次
   */
  @Cron(defaultMonitorConfig.scheduler.cronExpression)
  async handleCron() {
    this.logger.log('Starting scheduled monitor task...');
    await this.eventRegistry.executeAllEvents();
  }

  /**
   * 监控API耗时
   */
  private async monitorApiDuration(): Promise<void> {
    try {
      const timeRange = this.getMonitorTimeRange();
      const now = new Date();

      const config = defaultMonitorConfig.apiDuration;
      const aid = defaultMonitorConfig.defaultAid;

      const result = await this.queryService.apiDurationCount(
        timeRange,
        config.duration,
        aid,
        config.threshold,
      );

      if (this.alertService.shouldAlert(result)) {
        await this.alertService.handleAlert({
          eventName: 'api-duration-monitor',
          data: result,
          timestamp: now.toISOString(),
          description: `发现${result.length}个API接口耗时超过${config.duration}ms`,
        });
      }
    } catch (error) {
      this.logger.error(
        `API duration monitor failed: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * 监控API请求体大小
   */
  private async monitorApiBodySize(): Promise<void> {
    try {
      const timeRange = this.getMonitorTimeRange();
      const now = new Date();

      const config = defaultMonitorConfig.apiBodySize;
      const aid = defaultMonitorConfig.defaultAid;

      const result = await this.queryService.apiBodySizeCount(
        timeRange,
        aid,
        config.reqBodySize,
        config.resBodySize,
        config.threshold,
      );

      if (this.alertService.shouldAlert(result)) {
        await this.alertService.handleAlert({
          eventName: 'api-body-size-monitor',
          data: result,
          timestamp: now.toISOString(),
          description: `发现${result.length}个API接口请求体大小超过阈值`,
        });
      }
    } catch (error) {
      this.logger.error(
        `API body size monitor failed: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * 监控API错误HTTP状态码
   */
  private async monitorApiErrorHttpCode(): Promise<void> {
    try {
      const timeRange = this.getMonitorTimeRange();
      const now = new Date();

      const config = defaultMonitorConfig.apiErrorHttpCode;
      const aid = defaultMonitorConfig.defaultAid;

      const result = await this.queryService.apiErrorHttpCodeCount(
        timeRange,
        aid,
        config.statusCode,
        config.useGreaterEqual,
        config.threshold,
      );

      if (this.alertService.shouldAlert(result)) {
        await this.alertService.handleAlert({
          eventName: 'api-error-http-code-monitor',
          data: result,
          timestamp: now.toISOString(),
          description: `发现${result.length}个API接口HTTP错误状态码异常`,
        });
      }
    } catch (error) {
      this.logger.error(
        `API error HTTP code monitor failed: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * 监控API错误业务码
   */
  private async monitorApiErrorBusinessCode(): Promise<void> {
    try {
      const timeRange = this.getMonitorTimeRange();
      const now = new Date();

      const config = defaultMonitorConfig.apiErrorBusinessCode;
      const aid = defaultMonitorConfig.defaultAid;

      const result = await this.queryService.apiErrorBusinessCodeCount(
        timeRange,
        aid,
        config.errorCodes,
        config.threshold,
      );

      if (this.alertService.shouldAlert(result)) {
        await this.alertService.handleAlert({
          eventName: 'api-error-business-code-monitor',
          data: result,
          timestamp: now.toISOString(),
          description: `发现${result.length}个API接口业务错误码异常`,
        });
      }
    } catch (error) {
      this.logger.error(
        `API error business code monitor failed: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * 手动触发所有监控事件
   */
  async triggerAllMonitors(): Promise<void> {
    this.logger.log('Manually triggering all monitors...');
    await this.eventRegistry.executeAllEvents();
  }

  /**
   * 手动触发指定监控事件
   */
  async triggerMonitor(eventName: string): Promise<any> {
    this.logger.log(`Manually triggering monitor: ${eventName}`);
    return this.eventRegistry.executeEvent(eventName);
  }
}
