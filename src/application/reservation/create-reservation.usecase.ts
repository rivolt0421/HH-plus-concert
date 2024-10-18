import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { QueueService } from 'src/domain/queue/service/queue.service';
import { TokenService } from 'src/domain/queue/service/token.service';
import { Reservation } from 'src/domain/reservation/entity/reservation';
import { ReservationService } from 'src/domain/reservation/service/reservation.service';
import { SeatService } from 'src/domain/reservation/service/seat.service';
import { UserService } from 'src/domain/user/service/user.service';

@Injectable()
export class CreateReservationUsecase {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly reservationService: ReservationService,
    private readonly seatService: SeatService,
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly queueService: QueueService,
  ) {}

  async execute(
    date: string,
    seatNumber: number,
    token: string,
  ): Promise<Reservation> {
    const sessionId = await this.tokenService.getSessionId(token);
    const isAccessible = await this.queueService.isAccessible(sessionId);
    if (!isAccessible) {
      throw new BadRequestException('Not your turn');
    }

    const session = await this.queueService.getSession(sessionId);
    const user = await this.userService.findById(session.userId);

    const maxRetries = 5;
    let retries = 0;

    while (retries < maxRetries) {
      try {
        // transaction
        const reservation = await this.prismaService.tx(async () => {
          const seat = await this.seatService.assertNotOccupied(
            date,
            seatNumber,
          );
          return this.reservationService.make(seat.id, seat.version, user.id);
        });

        return reservation;
      } catch (error) {
        if (error.message === 'RESERVATION_FAILED') {
          retries++;
          await new Promise((resolve) => setTimeout(resolve, 100 * retries));
        } else {
          throw error;
        }
      }
    }

    throw new Error('Failed to create reservation after maximum retries');
  }
}
