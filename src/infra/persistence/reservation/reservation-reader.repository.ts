import { Injectable } from '@nestjs/common';
import { CatchPrismaNotFound } from 'src/common/decorators/catch-prisma.decorator';
import { PrismaService } from 'src/database/prisma.service';
import { Reservation } from 'src/domain/reservation/entity/reservation';
import { ReservationReaderRepository } from 'src/domain/reservation/repository/reservation-reader.interface';

@Injectable()
export class ReservationReaderRepositoryImpl
  implements ReservationReaderRepository
{
  constructor(private readonly prisma: PrismaService) {}

  @CatchPrismaNotFound('reservation')
  async findByIdOrThrow(id: number): Promise<Reservation> {
    return await (this.prisma.getTx() ?? this.prisma).reservation
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
