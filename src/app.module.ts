import { Module } from '@nestjs/common';
import { QueueModule } from './application/queue/queue.module';
import { ReservationModule } from './application/reservation/reservation.module';
import { UserModule } from './application/user/user.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [DatabaseModule, QueueModule, ReservationModule, UserModule],
})
export class AppModule {}
