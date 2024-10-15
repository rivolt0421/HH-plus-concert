import { Inject } from '@nestjs/common';
import { Seat } from '../entity/seat';
import {
  SEAT_READER_REPOSITORY,
  SeatReaderRepository,
} from '../repository/seat-reader.interface';
import { Reservation } from '../entity/reservation';

export class SeatService {
  constructor(
    @Inject(SEAT_READER_REPOSITORY)
    private readonly seatReader: SeatReaderRepository,
  ) {}

  async assertNotOccupied(date: Date, seatNumber: number): Promise<Seat> {
    const seat = await this.seatReader.findByDateAndSeatNumberOrThrow(
      date,
      seatNumber,
    );

    if (seat.isOccupied()) {
      throw new Error('Seat is already occupied');
    }

    return seat;
  }

  async validateForPayment(
    seatId: number,
    userId: number,
  ): Promise<{ seat: Seat; reservation: Reservation }> {
    const seat = await this.seatReader.findByIdOrThrow(seatId);

    const reservation = seat.getPendingReservationOf(userId);

    if (reservation === null) {
      throw new Error('Pending reservation not exists');
    }

    return { seat, reservation };
  }
}
