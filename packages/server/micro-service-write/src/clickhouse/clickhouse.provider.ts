import { Provider } from '@nestjs/common';
import { ClickHouseClient, createClient } from '@clickhouse/client';
export const CLICKHOUSE_CLIENT = 'CLICKHOUSE_CLIENT';

export const createClickHouseClient = (): Provider => ({
  provide: CLICKHOUSE_CLIENT,
  useFactory: () => {
    return createClient({
      host: `${process.env.CLICKHOUSE_HOST}:${process.env.CLICKHOUSE_PORT}`,
      username: process.env.CLICKHOUSE_USER,
      password: process.env.CLICKHOUSE_PASSWORD,
      database: process.env.CLICKHOUSE_DB,
      /**
       * 控制并发连接数，默认是10
       */
      max_open_connections: 50,
    });
  },
});
