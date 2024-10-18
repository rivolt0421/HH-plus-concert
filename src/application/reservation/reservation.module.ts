import { Module } from '@nestjs/common';
import { ReservationService } from 'src/domain/reservation/service/reservation.service';
import { GetAvailableDatesUsecase } from './get-available-dates.usecase';
import { GetAvailableSeatsUsecase } from './get-available-seats.usecase';
import { CreateReservationUsecase } from './create-reservation.usecase';
import { CompletePaymentUsecase } from './create-payment.usecase';
import { QueueModule } from '../queue/queue.module';
import { SeatService } from 'src/domain/reservation/service/seat.service';
import { PaymentService } from 'src/domain/payment/service/payment.service';
import { ScheduleService } from 'src/domain/reservation/service/schedule.service';
import { SCHEDULE_READER_REPOSITORY } from 'src/domain/reservation/repository/schedule-reader.interface';
import { ScheduleReaderRepositoryImpl } from 'src/infra/persistence/reservation/schedule-reader.repository';
import { SEAT_READER_REPOSITORY } from 'src/domain/reservation/repository/seat-reader.interface';
import { SeatReaderRepositoryImpl } from 'src/infra/persistence/reservation/seat-reader.repository';
import { RESERVATION_READER_REPOSITORY } from 'src/domain/reservation/repository/reservation-reader.interface';
import { ReservationReaderRepositoryImpl } from 'src/infra/persistence/reservation/reservation-reader.repository';
import { RESERVATION_WRITER_REPOSITORY } from 'src/domain/reservation/repository/reservation-writer.interface';
import { ReservationWriterRepositoryImpl } from 'src/infra/persistence/reservation/reservation-writer.repository';
import { PAYMENT_WRITER_REPOSITORY } from 'src/domain/payment/repository/payment-writer.interface';
import { PaymentWriterRepositoryImpl } from 'src/infra/persistence/payment/payment-writer.repository';
import { UserModule } from '../user/user.module';
import { ReservationController } from 'src/api/reservation/reservation.controller';

@Module({
  imports: [QueueModule, UserModule],
  controllers: [ReservationController],
  providers: [
    // services
    ScheduleService,
    SeatService,
    ReservationService,
    PaymentService,

    // usecases
    GetAvailableDatesUsecase,
    GetAvailableSeatsUsecase,
    CreateReservationUsecase,
    CompletePaymentUsecase,

    // repositories
    {
      provide: SCHEDULE_READER_REPOSITORY,
      useClass: ScheduleReaderRepositoryImpl,
    },
    {
      provide: SEAT_READER_REPOSITORY,
      useClass: SeatReaderRepositoryImpl,
    },
    {
      provide: RESERVATION_READER_REPOSITORY,
      useClass: ReservationReaderRepositoryImpl,
    },
    {
      provide: RESERVATION_WRITER_REPOSITORY,
      useClass: ReservationWriterRepositoryImpl,
    },
    {
      provide: PAYMENT_WRITER_REPOSITORY,
      useClass: PaymentWriterRepositoryImpl,
    },
  ],
  exports: [ReservationService],
})
export class ReservationModule {}
