import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
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
import { QueueGuard } from 'src/common/guards/queue.guard';
import { Request } from 'express';
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
  @UseGuards(QueueGuard)
  @GetAvailableSeatsSwagger()
  async getAvailableSeats(
    @Query('date') date: string,
  ): Promise<GetAvailableSeatsRes> {
    const seats = await this.getAvailableSeatsUsecase.execute(date);

    return { seats };
  }

  @Post('seat')
  @UseGuards(QueueGuard)
  @ReserveSeatSwagger()
  async reserveSeat(
    @Req() req: Request,
    @Body() reserveSeatDto: ReserveSeatReq,
  ): Promise<ReserveSeatRes> {
    const reservation = await this.createReservationUsecase.execute(
      reserveSeatDto.date,
      reserveSeatDto.seatNumber,
      req.sessionId,
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
}
