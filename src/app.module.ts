import { Module } from '@nestjs/common';
import { QueueModule } from './application/queue/queue.module';
import { ReservationModule } from './application/reservation/reservation.module';
import { UserModule } from './application/user/user.module';
import { DatabaseModule } from './database/database.module';
import { LoggerModule } from './common/logger/logger.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { HttpLoggingInterceptor } from './common/interceptors/http-logging.interceptor';

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
  ],
})
export class AppModule {}
