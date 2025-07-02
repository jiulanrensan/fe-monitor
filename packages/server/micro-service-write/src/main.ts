import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';

// 加载环境变量
dotenv.config({ path: '../../.env' });

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  logger.log('Starting write service...');
  logger.log('Environment variables loaded:', {
    CLICKHOUSE_HOST: process.env.CLICKHOUSE_HOST,
    CLICKHOUSE_PORT: process.env.CLICKHOUSE_PORT,
    CLICKHOUSE_USER: process.env.CLICKHOUSE_USER,
    CLICKHOUSE_PASSWORD: process.env.CLICKHOUSE_PASSWORD,
    CLICKHOUSE_DB: process.env.CLICKHOUSE_DB,
  });
  const app = await NestFactory.create(AppModule);

  await app.listen(process.env.PORT ?? 3000);
  logger.log(`Write service running on: ${await app.getUrl()}`);
}
bootstrap();
