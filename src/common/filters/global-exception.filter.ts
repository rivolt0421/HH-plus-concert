import {
  Catch,
  ExceptionFilter,
  HttpException,
  ArgumentsHost,
} from '@nestjs/common';
import { Logger as WinstonLogger } from 'winston';
import { InjectLogger } from '../logger/logger.decorator';

export class CustomException extends HttpException {
  message: string;
  statusCode: number;
  data?: any;

  constructor(message: string, statusCode: number, data?: any) {
    super(message, statusCode);
    this.message = message;
    this.statusCode = statusCode;
    this.data = data;
  }
}

class UnhandledException extends HttpException {
  constructor() {
    super('Internal Server Error', 500);
  }
}

@Catch(HttpException)
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(@InjectLogger() private readonly logger: WinstonLogger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    const e =
      exception instanceof HttpException ? exception : new UnhandledException();

    // 상세한 에러 로깅
    this.logger.error('Exception occurred', {
      context: 'GlobalExceptionFilter',
      path: request.url,
      method: request.method,
      statusCode: e.getStatus(),
      message: e.message,
      data: e instanceof CustomException ? e.data : undefined,
      stack: e.stack,
      timestamp: new Date().toISOString(),
      headers: request.headers,
      query: request.query,
      body: request.body,
    });

    response.status(e.getStatus()).json({
      message: e.message,
      data: e instanceof CustomException ? e.data : undefined,
    });
  }
}
