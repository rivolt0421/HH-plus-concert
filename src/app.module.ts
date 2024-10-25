import { Module } from '@nestjs/common';
import { QueueModule } from './application/queue/queue.module';
import { ReservationModule } from './application/reservation/reservation.module';
import { UserModule } from './application/user/user.module';
import { DatabaseModule } from './database/database.module';
import { LoggerModule } from './common/logger/logger.module';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpLoggingInterceptor } from './common/interceptors/http-logging.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { AuthGuard } from './common/guards/auth.guard';

@Module({
  imports: [
    DatabaseModule,
    QueueModule,
    ReservationModule,
    UserModule,
    LoggerModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpLoggingInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
