import { Inject } from '@nestjs/common';
import { Seat } from '../entity/seat';
import {
  SEAT_READER_REPOSITORY,
  SeatReaderRepository,
} from '../repository/seat-reader.interface';

export class SeatService {
  constructor(
    @Inject(SEAT_READER_REPOSITORY)
    private readonly seatReader: SeatReaderRepository,
  ) {}

  async assertNotOccupied(date: string, seatNumber: number): Promise<Seat> {
    const seat = await this.seatReader.findByDateAndSeatNumberOrThrow(
      date,
      seatNumber,
    );

    if (seat.isOccupied()) {
      throw new Error('Seat is already occupied');
    }

    return seat;
  }

  async validateForPayment(seatId: number, userId: number): Promise<Seat> {
    const seat = await this.seatReader.findByIdOrThrow(seatId);

    const pendingReservation = seat.getPendingReservationOf(userId);

    if (pendingReservation === null) {
      throw new Error('PENDING_RESERVATION_NOT_EXISTS');
    }

    return seat;
  }
}
