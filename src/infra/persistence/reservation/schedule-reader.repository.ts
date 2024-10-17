import { PrismaService } from 'src/database/prisma.service';
import { Reservation } from 'src/domain/reservation/entity/reservation';
import { Schedule } from 'src/domain/reservation/entity/schedule';
import { Seat } from 'src/domain/reservation/entity/seat';
import { ScheduleReaderRepository } from 'src/domain/reservation/repository/schedule-reader.interface';

export class ScheduleReaderRepositoryImpl implements ScheduleReaderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByDateOrThrow(date: string): Promise<Schedule> {
    const s = await (this.prisma.getTx() ?? this.prisma).schedule
      .findFirstOrThrow({
        where: {
          date,
        },
        include: {
          seats: {
            include: {
              reservations: true,
            },
          },
        },
      })
      .then((schedule) => {
        return new Schedule(
          schedule.id,
          schedule.date,
          schedule.seats.map(
            (seat) =>
              new Seat(
                seat.id,
                seat.number,
                seat.price,
                seat.reservations.map(
                  (reservation) =>
                    new Reservation(
                      reservation.id,
                      reservation.seatId,
                      reservation.userId,
                      reservation.expiresAt,
                      reservation.paymentId,
                      reservation.isCancelled,
                    ),
                ),
                seat.version,
              ),
          ),
        );
      });

    return s;
  }

  findAllDates(): Promise<string[]> {
    return (this.prisma.getTx() ?? this.prisma).schedule
      .findMany({
        select: {
          date: true,
        },
      })
      .then((schedules) => schedules.map((schedule) => schedule.date));
  }
}
