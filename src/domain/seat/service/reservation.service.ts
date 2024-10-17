import { Inject } from '@nestjs/common';
import { Reservation } from '../entity/reservation';
import {
  RESERVATION_WRITER_REPOSITORY,
  ReservationWriterRepository,
} from '../repository/reservation-writer.interface';
import {
  SEAT_READER_REPOSITORY,
  SeatReaderRepository,
} from '../repository/seat-reader.interface';

export class ReservationService {
  constructor(
    @Inject(SEAT_READER_REPOSITORY)
    private readonly seatReader: SeatReaderRepository,
    @Inject(RESERVATION_WRITER_REPOSITORY)
    private readonly reservationWriter: ReservationWriterRepository,
  ) {}

  async make(
    seatId: number,
    seatVersion: number,
    userId: number,
  ): Promise<Reservation> {
    const reservation = Reservation.of(seatId, userId);

    const savedReservation = await this.reservationWriter.saveWithSeatVersion(
      reservation,
      seatVersion,
    );

    if (savedReservation === null) {
      throw new Error('Reservation failed');
    }

    return savedReservation;
  }
}
