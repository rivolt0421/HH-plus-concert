import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { CompletePaymentUsecase } from 'src/application/reservation/create-payment.usecase';
import { GetAvailableDatesUsecase } from 'src/application/reservation/get-available-dates.usecase';
import { GetAvailableSeatsUsecase } from 'src/application/reservation/get-available-seats.usecase';
import { GetAvailableDatesRes } from './dto/get-available-dates.dto';
import { GetAvailableSeatsRes } from './dto/get-available-seats.dto';
import { ReserveSeatReq, ReserveSeatRes } from './dto/reserve-seat.dto';
import {
  CompletePaymentSwagger,
  GetAvailableDatesSwagger,
  GetAvailableSeatsSwagger,
  ReserveSeatSwagger,
} from './reservation.controller.decorator';
import { CreateReservationUsecase } from 'src/application/reservation/create-reservation.usecase';
import {
  CompletePaymentReq,
  CompletePaymentRes,
} from './dto/complete-payment.dto';

@Controller('reservation')
export class ReservationController {
  constructor(
    private readonly getAvailableDatesUsecase: GetAvailableDatesUsecase,
    private readonly getAvailableSeatsUsecase: GetAvailableSeatsUsecase,
    private readonly createReservationUsecase: CreateReservationUsecase,
    private readonly completePaymentUsecase: CompletePaymentUsecase,
  ) {}

  @Get('dates/available')
  @GetAvailableDatesSwagger()
  async getAvailableDates(): Promise<GetAvailableDatesRes> {
    const dates = await this.getAvailableDatesUsecase.execute();

    return { dates };
  }

  @Get('seats/available')
  @GetAvailableSeatsSwagger()
  async getAvailableSeats(
    @Req() req: Request,
    @Query('date') date: string,
  ): Promise<GetAvailableSeatsRes> {
    const token = this.extractTokenFromHeader(req);
    if (!token) {
      throw new UnauthorizedException('Invalid or expired token');
    }
    const seats = await this.getAvailableSeatsUsecase.execute(date, token);

    return { seats };
  }

  @Post('seat')
  @ReserveSeatSwagger()
  async reserveSeat(
    @Req() req: Request,
    @Body() reserveSeatDto: ReserveSeatReq,
  ): Promise<ReserveSeatRes> {
    const token = this.extractTokenFromHeader(req);
    if (!token) {
      throw new UnauthorizedException('Invalid or expired token');
    }
    const reservation = await this.createReservationUsecase.execute(
      reserveSeatDto.date,
      reserveSeatDto.seatNumber,
      token,
    );

    return { reservationId: reservation.id };
  }

  @Post('payment')
  @CompletePaymentSwagger()
  async completePayment(
    @Body() completePaymentDto: CompletePaymentReq,
  ): Promise<CompletePaymentRes> {
    const payment = await this.completePaymentUsecase.execute(
      completePaymentDto.reservationId,
      completePaymentDto.sessionId,
      {
        amount: completePaymentDto.amount,
        paidAt: new Date(completePaymentDto.paidAt),
      },
    );

    return { paymentId: payment.id, status: payment.status };
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.get('authorization');
    const [type, token] = authHeader?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
