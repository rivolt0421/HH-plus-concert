import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Payment } from 'src/domain/payment/entity/payment';
import { PaymentService } from 'src/domain/payment/service/payment.service';
import { QueueService } from 'src/domain/queue/service/queue.service';
import { ReservationService } from 'src/domain/reservation/service/reservation.service';
import { SeatService } from 'src/domain/reservation/service/seat.service';
import { UserService } from 'src/domain/user/service/user.service';

@Injectable()
export class CompletePaymentUsecase {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly queueService: QueueService,
    private readonly seatService: SeatService,
    private readonly reservationService: ReservationService,
    private readonly paymentService: PaymentService,
    private readonly userService: UserService,
  ) {}

  async execute(
    reservationId: number,
    sessionId: number,
    paymentInfo: {
      amount: number;
      paidAt: Date;
    },
  ): Promise<Payment> {
    const result = await this.prismaService.tx(async () => {
      const reservation = await this.reservationService.findByIdOrThrow(
        reservationId,
      );

      try {
        const seat = await this.seatService.validateForPayment(
          reservation.seatId,
          reservation.userId,
        );

        await this.userService.usePoint(reservation.userId, paymentInfo.amount);
        const payment = await this.paymentService.createPaid(
          paymentInfo.amount,
          paymentInfo.paidAt,
        );

        await this.reservationService.markAsPaid(
          reservation.id,
          payment.id,
          seat.version,
        );

        return payment;
      } catch (error) {
        // TODO: 결제 취소 처리
        throw new Error('COMPLETE_PAYMENT_FAILED');
      }
    });

    await this.queueService.terminateSession(sessionId);

    return result;
  }
}
