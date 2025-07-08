import { Injectable, Logger } from '@nestjs/common'
import { ClickHouseConnectionManagerService } from '../clickhouse/clickhouse-connection-manager.service'

/**
 * 优雅关闭服务
 * 负责在应用关闭时执行各种清理工作
 * 注意：ClickHouseConnectionManagerService 已经实现了 OnModuleDestroy，
 * 会自动处理连接关闭，这里主要负责手动关闭和信号处理
 */
@Injectable()
export class GracefulShutdownService {
  private readonly logger = new Logger(GracefulShutdownService.name)

  constructor(private readonly clickhouseConnectionManager: ClickHouseConnectionManagerService) {}

  /**
   * 手动触发优雅关闭
   * 可以在需要时手动调用
   */
  async shutdown(): Promise<void> {
    this.logger.log('Manual graceful shutdown initiated...')
    try {
      await this.clickhouseConnectionManager.disconnect()
      this.logger.log('Manual graceful shutdown completed successfully')
    } catch (error) {
      this.logger.error('Error during manual graceful shutdown:', error)
      throw error
    }
  }

  /**
   * 注册进程信号处理器
   * 用于捕获 SIGTERM 和 SIGINT 信号
   */
  registerSignalHandlers(): void {
    const signals = ['SIGTERM', 'SIGINT']
    signals.forEach((signal) => {
      process.on(signal, async () => {
        this.logger.log(`Received ${signal} signal, starting graceful shutdown...`)
        try {
          await this.shutdown()
          process.exit(0)
        } catch (error) {
          this.logger.error(`Error during signal-based shutdown:`, error)
          process.exit(1)
        }
      })
    })
    this.logger.log('Signal handlers registered for graceful shutdown')
  }
}
