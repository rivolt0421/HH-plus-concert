import { PrismaService } from 'src/database/prisma.service';
import { Reservation } from 'src/domain/reservation/entity/reservation';
import { ReservationReaderRepository } from 'src/domain/reservation/repository/reservation-reader.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ReservationReaderRepositoryImpl
  implements ReservationReaderRepository
{
  constructor(private readonly prisma: PrismaService) {}

  findByIdOrThrow(id: number): Promise<Reservation> {
    return (this.prisma.getTx() ?? this.prisma).reservation
      .findUniqueOrThrow({
        where: { id },
      })
      .then(
        (r) =>
          new Reservation(
            r.id,
            r.seatId,
            r.userId,
            r.expiresAt,
            r.paymentId,
            r.isCancelled,
          ),
      );
  }
}
