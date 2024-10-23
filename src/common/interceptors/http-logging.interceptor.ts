import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Logger } from 'winston';
import { InjectLogger } from '../logger/logger.decorator';

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  constructor(@InjectLogger() private readonly logger: Logger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, headers } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: (data: any) => {
          const endTime = Date.now();
          this.logger.http(
            `${method} ${url} ${JSON.stringify(body)} ${
              endTime - startTime
            }ms ${JSON.stringify(data)}`,
          );
        },
        error: (error: any) => {
          const endTime = Date.now();
          this.logger.error(
            `${method} ${url} ${JSON.stringify(body)} ${
              endTime - startTime
            }ms ${error.message}`,
          );
        },
      }),
    );
  }
}
