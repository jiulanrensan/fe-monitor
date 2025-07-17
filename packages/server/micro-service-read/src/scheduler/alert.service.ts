import { Injectable, Logger } from '@nestjs/common'

export interface AlertData {
  project: string
  env?: string
  eventName: string
  data: any[]
  stats: any
  dingTalkWebhookUrl: string
  timeRange: {
    start: string
    end: string
  }
  description: string
}

@Injectable()
export class AlertService {
  private readonly logger = new Logger(AlertService.name)

  /**
   * 处理告警
   */
  async handleAlert(alertData: AlertData): Promise<void> {
    this.logger.log(`Processing alert for event: ${alertData.eventName}`)
    this.logger.log(`Alert data: ${JSON.stringify(alertData)}`)

    // TODO: 实现具体的告警逻辑
    // 例如：发送邮件、短信、钉钉消息等
    await this.sendAlert(alertData)
  }

  /**
   * 格式化统计信息为易读的文字描述
   */
  private formatStats(stats: {
    read_rows?: string
    read_bytes?: string
    total_rows_to_read?: string
    elapsed_ns?: string
  }): string {
    const descriptions: string[] = []

    if (stats.read_rows) {
      const readRows = parseInt(stats.read_rows)
      descriptions.push(`读取 ${readRows.toLocaleString()} 行数据`)
    }

    // if (stats.read_bytes) {
    //   const readBytes = parseInt(stats.read_bytes)
    //   const mb = (readBytes / (1024 * 1024)).toFixed(2)
    //   descriptions.push(`读取了 ${mb} MB 数据`)
    // }

    // if (stats.total_rows_to_read) {
    //   const totalRows = parseInt(stats.total_rows_to_read)
    //   descriptions.push(`总共需要读取 ${totalRows.toLocaleString()} 行`)
    // }

    if (stats.elapsed_ns) {
      const elapsedNs = parseInt(stats.elapsed_ns)
      const elapsedMs = (elapsedNs / 1000000).toFixed(2)
      descriptions.push(`查询耗时 ${elapsedMs} 毫秒`)
    }

    return descriptions.length > 0 ? `${descriptions.join('，')}` : '无统计信息'
  }

  /**
   * 发送告警（空方法，待实现）
   */
  private async sendAlert(alertData: AlertData): Promise<void> {
    const statsDescription = this.formatStats(alertData.stats)
    const newAlertData = {
      ...alertData,
      stats: statsDescription
    }
    // 示例：这里可以添加具体的告警实现
    // await this.sendEmail(alertData);
    // await this.sendSms(alertData);
    await this.sendDingTalk(newAlertData)
  }

  private async sendDingTalk(alertData: AlertData): Promise<void> {
    const { project, env, eventName, data, timeRange, description, stats, dingTalkWebhookUrl } =
      alertData

    // 构建消息内容
    let message = `项目: ${project}\n\n`
    message += `环境: ${env || 'dev'}\n\n`
    message += `${description}\n\n`
    message += `时间范围: ${timeRange.start} - ${timeRange.end}\n\n`
    message += `统计信息: ${stats}\n\n`

    // 添加数据详情
    data.forEach((item, index) => {
      message += `\n\n`
      Object.entries(item).forEach(([key, value]) => {
        message += `${key.toUpperCase()}: ${value}\n\n`
      })
      message += `\n\n`
    })

    // 钉钉机器人消息格式
    const dingTalkMessage = {
      msgtype: 'actionCard',
      actionCard: {
        title: '监控告警',
        text: message,
        btnOrientation: '0',
        singleTitle: '查看详情',
        singleURL: 'https://www.baidu.com'
      }
    }

    // this.logger.log(`${JSON.stringify(dingTalkMessage)}`)

    // try {
    //   this.logger.log(`正在发送钉钉告警消息到: ${dingTalkWebhookUrl}`)

    //   const response = await fetch(dingTalkWebhookUrl, {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify(dingTalkMessage)
    //   })

    //   if (!response.ok) {
    //     const errorText = await response.text()
    //     throw new Error(`HTTP ${response.status}: ${errorText}`)
    //   }

    //   const result = await response.json()
    //   this.logger.log(`钉钉告警发送成功: ${JSON.stringify(result)}`)
    // } catch (error) {
    //   this.logger.error(`钉钉告警发送失败: ${error.message}`)
    //   this.logger.error(`错误详情: ${error.stack}`)
    //   throw error
    // }
  }

  /**
   * 检查是否需要告警
   */
  shouldAlert(data: any[]): boolean {
    return data && data.length > 0
  }
}
