import { Module } from '@nestjs/common'
import { QueryService } from './query.service'
import { QueryController } from './query.controller'
import { ClickHouseModule } from '../../../shared/src'

@Module({
  imports: [ClickHouseModule],
  controllers: [QueryController],
  providers: [QueryService],
  exports: [QueryService]
})
export class QueryModule {}
