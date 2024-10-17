import {
  Body,
  ConflictException,
  Controller,
  Get,
  Headers,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ChargePointSwagger,
  EnterQueueSwagger,
  GetAvailableDatesSwagger,
  GetAvailableSeatsSwagger,
  GetPointSwagger,
  GetQueuePositionSwagger,
  ProcessPaymentSwagger,
  ReserveSeatSwagger,
} from './app.controller.decorator';
import { AppService } from './app.service';
import {
  ChargePointReq,
  EnterQueueReq,
  EnterQueueRes,
  GetAvailableDatesRes,
  GetAvailableSeatsRes,
  GetPointRes,
  GetQueuePositionRes,
  ProcessPaymentReq,
  ProcessPaymentRes,
  ReserveSeatReq,
  ReserveSeatRes,
} from './dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('queue/enter')
  @EnterQueueSwagger()
  enterQueue(@Body() enterQueueDto: EnterQueueReq): Promise<EnterQueueRes> {
    if (enterQueueDto.userId === 0) {
      throw new NotFoundException('User Not Exists');
    }

    return new Promise((resolve) => {
      resolve({
        token: 'mock_token_' + Math.random().toString(36).substr(2, 9),
        queueNumber: Math.floor(Math.random() * 1000) + 1,
      });
    });
  }

  @Get('queue/position')
  @GetQueuePositionSwagger()
  getQueuePosition(
    @Headers('X-Mock-Token-Fail') mockFail?: string,
  ): Promise<GetQueuePositionRes> {
    if (mockFail === 'true') {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return new Promise((resolve) => {
      resolve({
        remainingCount: Math.floor(Math.random() * 1000) + 1,
        estimatedWaitTime: Math.floor(Math.random() * 30) + 1,
      });
    });
  }

  @Get('reservation/dates/available')
  @GetAvailableDatesSwagger()
  getAvailableDates(): Promise<GetAvailableDatesRes> {
    const dates = [];
    for (let i = 1; i <= 5; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }

    return new Promise((resolve) => {
      resolve({
        dates: dates,
      });
    });
  }

  @Get('reservation/seats/available')
  @GetAvailableSeatsSwagger()
  getAvailableSeats(
    @Query('date') date: string,
    @Headers('X-Mock-Token-Fail') mockFail?: string,
  ): Promise<GetAvailableSeatsRes> {
    if (mockFail === 'true') {
      throw new UnauthorizedException('Invalid or expired token');
    }
    // Mock response
    return new Promise((resolve) => {
      resolve({
        seats: Array.from({ length: 50 }, (_, i) => i + 1).filter(
          () => Math.random() > 0.5,
        ),
      });
    });
  }

  @Post('reservation/seat')
  @ReserveSeatSwagger()
  reserveSeat(
    @Body() reserveSeatDto: ReserveSeatReq,
    @Headers('X-Mock-Token-Fail') mockFail?: string,
  ): Promise<ReserveSeatRes> {
    if (mockFail === 'true') {
      throw new UnauthorizedException('Invalid or expired token');
    }
    if (reserveSeatDto.seatNumber === 13) {
      throw new ConflictException('This seat is already reserved');
    }
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    return new Promise((resolve) => {
      resolve({
        reservationId:
          'mock_reservation_' + Math.random().toString(36).substr(2, 9),
      });
    });
  }

  @Post('reservation/payment')
  @ProcessPaymentSwagger()
  processPayment(
    @Body() processPaymentDto: ProcessPaymentReq,
  ): Promise<ProcessPaymentRes> {
    if (processPaymentDto.reservationId === 'invalid') {
      throw new NotFoundException('Invalid reservation ID');
    }
    if (processPaymentDto.reservationId === 'duplicate') {
      throw new ConflictException(
        'Duplicate payment attempt. This reservation has already been paid for.',
      );
    }

    return new Promise((resolve) => {
      resolve({
        paymentId: 'mock_payment_' + Math.random().toString(36).substr(2, 9),
        status: 'completed',
      });
    });
  }

  @Get('user/:userId/point')
  @GetPointSwagger()
  getPoint(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<GetPointRes> {
    if (userId === 0) {
      throw new NotFoundException('User Not Exists');
    }
    // Mock response
    return new Promise((resolve) => {
      resolve({
        userId: userId,
        point: Math.floor(Math.random() * 100000),
      });
    });
  }

  @Patch('user/:userId/point')
  @ChargePointSwagger()
  chargePoint(@Body() chargePointDto: ChargePointReq): Promise<GetPointRes> {
    if (chargePointDto.userId === 0) {
      throw new NotFoundException('User Not Exists');
    }
    return new Promise((resolve) => {
      resolve({
        userId: chargePointDto.userId,
        point: Math.floor(Math.random() * 100000) + chargePointDto.amount,
      });
    });
  }
}
