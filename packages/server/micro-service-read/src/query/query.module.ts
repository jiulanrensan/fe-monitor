import { Module } from '@nestjs/common';
import { QueryService } from './query.service';
import { QueryController } from './query.controller';
import { ClickHouseModule } from '../clickhouse/clickhouse.module';

@Module({
  imports: [ClickHouseModule],
  controllers: [QueryController],
  providers: [QueryService],
  exports: [QueryService],
})
export class QueryModule {}
