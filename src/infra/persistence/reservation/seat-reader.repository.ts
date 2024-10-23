import { PrismaService } from 'src/database/prisma.service';
import { Reservation } from 'src/domain/reservation/entity/reservation';
import { Seat } from 'src/domain/reservation/entity/seat';
import { SeatReaderRepository } from 'src/domain/reservation/repository/seat-reader.interface';
import { Injectable } from '@nestjs/common';
import { CatchPrismaNotFound } from 'src/common/decorators/catch-prisma.decorator';

@Injectable()
export class SeatReaderRepositoryImpl implements SeatReaderRepository {
  constructor(private readonly prisma: PrismaService) {}

  @CatchPrismaNotFound('seat')
  async findByIdOrThrow(id: number): Promise<Seat> {
    return await (this.prisma.getTx() ?? this.prisma).seat
      .findUniqueOrThrow({
        where: { id },
        include: {
          reservations: true,
        },
      })
      .then((seat) => {
        return new Seat(
          seat.id,
          seat.number,
          seat.price,
          seat.reservations.map((reservation) => {
            return new Reservation(
              reservation.id,
              reservation.seatId,
              reservation.userId,
              reservation.expiresAt,
              reservation.paymentId,
              reservation.isCancelled,
            );
          }),
          seat.version,
        );
      });
  }

  @CatchPrismaNotFound('seat')
  async findByDateAndSeatNumberOrThrow(
    date: string,
    seatNumber: number,
  ): Promise<Seat> {
    return await (this.prisma.getTx() ?? this.prisma).seat
      .findFirstOrThrow({
        where: { number: seatNumber, schedule: { date } },
        include: {
          reservations: true,
        },
      })
      .then((seat) => {
        return new Seat(
          seat.id,
          seat.number,
          seat.price,
          seat.reservations.map((reservation) => {
            return new Reservation(
              reservation.id,
              reservation.seatId,
              reservation.userId,
              reservation.expiresAt,
              reservation.paymentId,
              reservation.isCancelled,
            );
          }),
          seat.version,
        );
      });
  }
}
