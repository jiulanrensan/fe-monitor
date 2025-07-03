import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { QueryService } from './query.service';
import {
  ExecuteQueryDto,
  AggregationQueryDto,
  ApiDurationQueryDto,
  ApiBodySizeQueryDto,
  ApiErrorHttpCodeQueryDto,
  ApiErrorBusinessCodeQueryDto,
} from './dto';

@Controller('query')
export class QueryController {
  private readonly logger = new Logger(QueryController.name);

  constructor(private readonly queryService: QueryService) {}

  /**
   * 获取表结构
   */
  @Get('schema/:tableName')
  async getTableSchema(@Param('tableName') tableName: string) {
    try {
      this.logger.log(`Getting schema for table: ${tableName}`);
      const result = await this.queryService.getTableSchema(tableName);
      return {
        success: true,
        data: result,
        tableName,
      };
    } catch (error) {
      this.logger.error(`Get schema failed: ${error.message}`, error.stack);
      throw new HttpException(
        {
          success: false,
          message: `获取表结构失败: ${error.message}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 获取表列表
   */
  @Get('tables')
  async getTables() {
    try {
      this.logger.log('Getting table list');
      const result = await this.queryService.getTables();
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error(`Get tables failed: ${error.message}`, error.stack);
      throw new HttpException(
        {
          success: false,
          message: `获取表列表失败: ${error.message}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 获取数据库列表
   */
  @Get('databases')
  async getDatabases() {
    try {
      this.logger.log('Getting database list');
      const result = await this.queryService.getDatabases();
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error(`Get databases failed: ${error.message}`, error.stack);
      throw new HttpException(
        {
          success: false,
          message: `获取数据库列表失败: ${error.message}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 执行自定义查询
   */
  @Post('execute')
  async executeQuery(@Body() dto: ExecuteQueryDto) {
    try {
      this.logger.log(`Received query execution request: ${dto.query}`);
      const result = await this.queryService.executeQuery(dto.query);
      return {
        success: true,
        data: result,
        count: result.length,
      };
    } catch (error) {
      this.logger.error(
        `Query execution failed: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        {
          success: false,
          message: `查询执行失败: ${error.message}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 执行聚合查询
   */
  @Post('aggregation')
  async executeAggregation(@Body() dto: AggregationQueryDto) {
    try {
      this.logger.log(
        `Executing aggregation query for table: ${dto.tableName}`,
      );
      const result = await this.queryService.executeAggregation(
        dto.tableName,
        dto.aggregation,
        dto.groupBy,
        dto.where,
      );
      return {
        success: true,
        data: result,
        count: result.length,
      };
    } catch (error) {
      this.logger.error(
        `Aggregation query failed: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        {
          success: false,
          message: `聚合查询失败: ${error.message}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 查询api请求总耗时数据条数
   */
  @Post('apiDurationCount')
  async apiDurationCount(@Body() dto: ApiDurationQueryDto) {
    try {
      this.logger.log(
        `Getting data count for app: ${dto.aid}, duration: ${dto.duration}, threshold: ${dto.threshold}`,
      );
      const result = await this.queryService.apiDurationCount(
        dto.timeRange,
        dto.duration,
        dto.aid,
        dto.threshold,
      );
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error(`Get data count failed: ${error.message}`, error.stack);
      throw new HttpException(
        {
          success: false,
          message: `查询数据条数失败: ${error.message}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 查询body大小数据条数
   */
  @Post('apiBodySizeCount')
  async apiBodySizeCount(@Body() dto: ApiBodySizeQueryDto) {
    try {
      this.logger.log(
        `Getting body size count for app: ${dto.aid}, reqBodySize: ${dto.reqBodySize}, resBodySize: ${dto.resBodySize}, threshold: ${dto.threshold}`,
      );
      const result = await this.queryService.apiBodySizeCount(
        dto.timeRange,
        dto.aid,
        dto.reqBodySize,
        dto.resBodySize,
        dto.threshold,
      );
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error(
        `Get body size count failed: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        {
          success: false,
          message: `查询body大小数据条数失败: ${error.message}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 查询错误http状态码数据条数
   */
  @Post('apiErrorHttpCodeCount')
  async apiErrorHttpCodeCount(@Body() dto: ApiErrorHttpCodeQueryDto) {
    try {
      this.logger.log(
        `Getting error http code count for app: ${dto.aid}, statusCode: ${dto.statusCode}, threshold: ${dto.threshold}`,
      );
      const result = await this.queryService.apiErrorHttpCodeCount(
        dto.timeRange,
        dto.aid,
        dto.statusCode,
        dto.useGreaterEqual,
        dto.threshold,
      );
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error(
        `Get error http code count failed: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        {
          success: false,
          message: `查询错误HTTP状态码数据条数失败: ${error.message}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 查询错误业务码数据条数
   */
  @Post('apiErrorBusinessCodeCount')
  async apiErrorBusinessCodeCount(@Body() dto: ApiErrorBusinessCodeQueryDto) {
    try {
      this.logger.log(
        `Getting error business code count for app: ${dto.aid}, threshold: ${dto.threshold}`,
      );
      const result = await this.queryService.apiErrorBusinessCodeCount(
        dto.timeRange,
        dto.aid,
        dto.errorCodes,
        dto.threshold,
      );
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error(
        `Get error business code count failed: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        {
          success: false,
          message: `查询错误业务码数据条数失败: ${error.message}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 健康检查
   */
  @Get('health')
  async health() {
    return {
      success: true,
      message: 'Query service is healthy',
      timestamp: new Date().toISOString(),
    };
  }
}
