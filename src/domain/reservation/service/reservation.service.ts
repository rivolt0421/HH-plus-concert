import { Inject } from '@nestjs/common';
import { Reservation } from '../entity/reservation';
import {
  RESERVATION_READER_REPOSITORY,
  ReservationReaderRepository,
} from '../repository/reservation-reader.interface';
import {
  RESERVATION_WRITER_REPOSITORY,
  ReservationWriterRepository,
} from '../repository/reservation-writer.interface';

export class ReservationService {
  constructor(
    @Inject(RESERVATION_READER_REPOSITORY)
    private readonly reservationReader: ReservationReaderRepository,
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
      throw new Error('RESERVATION_FAILED');
    }

    return savedReservation;
  }

  async markAsPaid(
    id: number,
    paymentId: number,
    seatVersion: number,
  ): Promise<Reservation> {
    const reservation = await this.reservationReader.findByIdOrThrow(id);

    reservation.markAsPaid(paymentId);

    const savedReservation = await this.reservationWriter.saveWithSeatVersion(
      reservation,
      seatVersion,
    );

    if (savedReservation === null) {
      throw new Error('MARK_AS_PAID_FAILED');
    }

    return savedReservation;
  }

  async findByIdOrThrow(id: number): Promise<Reservation> {
    return this.reservationReader.findByIdOrThrow(id);
  }
}
