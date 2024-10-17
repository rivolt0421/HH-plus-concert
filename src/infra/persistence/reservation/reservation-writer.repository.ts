import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';
import { Reservation } from 'src/domain/reservation/entity/reservation';
import { ReservationWriterRepository } from 'src/domain/reservation/repository/reservation-writer.interface';

export class ReservationWriterRepositoryImpl
  implements ReservationWriterRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async saveWithSeatVersion(
    reservation: Omit<Reservation, 'id'>,
    seatVersion: number,
  ): Promise<Reservation | null> {
    try {
      await (this.prisma.getTx() ?? this.prisma).seat.update({
        where: {
          id: reservation.seatId,
          version: seatVersion,
        },
        data: {
          version: {
            increment: 1,
          },
        },
      });

      return (this.prisma.getTx() ?? this.prisma).reservation
        .create({
          data: {
            ...reservation,
          },
        })
        .then((reservation) => {
          return new Reservation(
            reservation.id,
            reservation.seatId,
            reservation.userId,
            reservation.expiresAt,
            reservation.paymentId,
            reservation.isCancelled,
          );
        });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === this.prisma.errorCode.RECORD_NOT_FOUND) {
          return null;
        }
      }
      throw error;
    }
  }
}
