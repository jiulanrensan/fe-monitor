import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { Logger } from '@nestjs/common'
import { ValidationPipe } from '@nestjs/common'
import { envLoader } from '../../shared/src/utils/env-loader.util'

/**
 * 加载环境配置
 */
envLoader.load()

async function bootstrap() {
  const logger = new Logger('Bootstrap')
  logger.log('Starting read service...')
  logger.log('Environment variables loaded:', {
    CLICKHOUSE_HOST: process.env.CLICKHOUSE_HOST,
    CLICKHOUSE_PORT: process.env.CLICKHOUSE_PORT,
    CLICKHOUSE_USER: process.env.CLICKHOUSE_USER,
    CLICKHOUSE_PASSWORD: process.env.CLICKHOUSE_PASSWORD,
    CLICKHOUSE_DB: process.env.CLICKHOUSE_DB,
    READ_SERVICE_PORT: process.env.READ_SERVICE_PORT
  })
  const app = await NestFactory.create(AppModule)

  // 添加全局校验管道
  app.useGlobalPipes(
    new ValidationPipe({
      /**
       * true: 自动转换类型（如字符串转数字）
       */
      transform: true,
      /**
       * false: 保留所有字段，包括未定义的
       */
      whitelist: true,
      /**
       * false: 不禁止未定义的字段,不会抛出错误
       */
      forbidNonWhitelisted: false,
      errorHttpStatusCode: 400
    })
  )

  const port = process.env.READ_SERVICE_PORT ?? 3000
  await app.listen(port)
  logger.log(`Read service running on: http://127.0.0.1:${port}`)
}
bootstrap()
