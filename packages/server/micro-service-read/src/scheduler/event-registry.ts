import { Injectable, Logger } from '@nestjs/common';

export interface MonitorEvent {
  name: string;
  handler: () => Promise<any>;
  description: string;
}

@Injectable()
export class EventRegistry {
  private readonly logger = new Logger(EventRegistry.name);
  private events: Map<string, MonitorEvent> = new Map();

  /**
   * 注册监控事件
   */
  registerEvent(event: MonitorEvent): void {
    if (this.events.has(event.name)) {
      this.logger.warn(
        `Event ${event.name} already registered, overwriting...`,
      );
    }

    this.events.set(event.name, event);
    this.logger.log(`Registered event: ${event.name} - ${event.description}`);
  }

  /**
   * 获取所有注册的事件
   */
  getAllEvents(): MonitorEvent[] {
    return Array.from(this.events.values());
  }

  /**
   * 获取指定事件
   */
  getEvent(eventName: string): MonitorEvent | undefined {
    return this.events.get(eventName);
  }

  /**
   * 执行所有注册的事件
   */
  async executeAllEvents(): Promise<void> {
    this.logger.log(`Executing ${this.events.size} registered events...`);

    const executionPromises = Array.from(this.events.values()).map(
      async (event) => {
        try {
          this.logger.log(`Executing event: ${event.name}`);
          const result = await event.handler();
          this.logger.log(`Event ${event.name} executed successfully`);
          return { event: event.name, result, success: true };
        } catch (error) {
          this.logger.error(
            `Event ${event.name} execution failed: ${error.message}`,
            error.stack,
          );
          return { event: event.name, error: error.message, success: false };
        }
      },
    );

    const results = await Promise.allSettled(executionPromises);

    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        this.logger.error(`Event execution promise rejected: ${result.reason}`);
      }
    });

    this.logger.log('All events execution completed');
  }

  /**
   * 执行指定事件
   */
  async executeEvent(eventName: string): Promise<any> {
    const event = this.events.get(eventName);
    if (!event) {
      throw new Error(`Event ${eventName} not found`);
    }

    this.logger.log(`Executing event: ${eventName}`);
    try {
      const result = await event.handler();
      this.logger.log(`Event ${eventName} executed successfully`);
      return result;
    } catch (error) {
      this.logger.error(
        `Event ${eventName} execution failed: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
