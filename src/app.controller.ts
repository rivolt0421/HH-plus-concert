import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpStatus,
  UnauthorizedException,
  Headers,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiHeader,
  ApiBody,
} from '@nestjs/swagger';
import { AppService } from './app.service';
import {
  CreateTokenDto,
  ReserveSeatDto,
  ProcessPaymentDto,
  ChargeBalanceDto,
} from './dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('queue-token')
  @ApiOperation({ summary: '대기열 토큰 발급' })
  @ApiBody({
    type: CreateTokenDto,
    description: 'userId가 "0"일 경우 User Not Exists 에러를 반환합니다.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '토큰 발급 성공',
    schema: {
      type: 'object',
      properties: {
        token: { type: 'string' },
        queueNumber: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '유저 정보가 존재하지 않음',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number' },
        message: { type: 'string' },
      },
    },
  })
  createToken(@Body() createTokenDto: CreateTokenDto) {
    if (createTokenDto.userId === '0') {
      throw new NotFoundException('User Not Exists');
    }
    return {
      token: 'mock_token_' + Math.random().toString(36).substr(2, 9),
      queueNumber: Math.floor(Math.random() * 1000) + 1,
    };
  }

  @Get('queue-position')
  @ApiOperation({ summary: '대기 번호 조회' })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token',
    required: true,
  })
  @ApiHeader({
    name: 'X-Mock-Token-Fail',
    required: false,
    description:
      '이 헤더가 "true"로 설정되면 토큰 검증 실패를 시뮬레이션합니다.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '대기 번호 조회 성공',
    schema: {
      type: 'object',
      properties: {
        queueNumber: { type: 'number' },
        estimatedWaitTime: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '토큰 검증 실패',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number' },
        message: { type: 'string' },
      },
    },
  })
  @ApiBearerAuth()
  getQueuePosition(@Headers('X-Mock-Token-Fail') mockFail: string) {
    if (mockFail === 'true') {
      throw new UnauthorizedException('Invalid or expired token');
    }
    return {
      queueNumber: Math.floor(Math.random() * 1000) + 1,
      estimatedWaitTime: Math.floor(Math.random() * 30) + 1,
    };
  }

  @Get('available-dates')
  @ApiOperation({ summary: '예약 가능 날짜 조회' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '예약 가능 날짜 조회 성공',
    schema: {
      type: 'array',
      items: { type: 'string', format: 'date' },
    },
  })
  getAvailableDates() {
    // Mock response
    const dates = [];
    for (let i = 1; i <= 5; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  }

  @Get('available-seats')
  @ApiOperation({ summary: '예약 가능 좌석 조회' })
  @ApiQuery({
    name: 'date',
    type: 'string',
    example: '2023-05-01',
    description: '조회할 날짜. 형식: YYYY-MM-DD',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '예약 가능 좌석 조회 성공',
    schema: {
      type: 'array',
      items: { type: 'number' },
    },
  })
  @ApiBearerAuth()
  getAvailableSeats(@Query('date') date: string) {
    // Mock response
    return Array.from({ length: 50 }, (_, i) => i + 1).filter(
      () => Math.random() > 0.5,
    );
  }

  @Post('reserve-seat')
  @ApiOperation({ summary: '좌석 예약 요청' })
  @ApiBody({
    type: ReserveSeatDto,
    description:
      'seatNumber가 13인 경우, 이미 예약된 좌석으로 간주하여 에러를 반환합니다.',
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token',
    required: true,
  })
  @ApiHeader({
    name: 'X-Mock-Token-Fail',
    required: false,
    description:
      '이 헤더가 "true"로 설정되면 토큰 검증 실패를 시뮬레이션합니다.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '좌석 예약 성공',
    schema: {
      type: 'object',
      properties: {
        reservationId: { type: 'string' },
        expiresAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '토큰 검증 실패',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: '이미 예약된 좌석',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number' },
        message: { type: 'string' },
      },
    },
  })
  @ApiBearerAuth()
  reserveSeat(
    @Body() reserveSeatDto: ReserveSeatDto,
    @Headers('X-Mock-Token-Fail') mockFail: string,
  ) {
    if (mockFail === 'true') {
      throw new UnauthorizedException('Invalid or expired token');
    }
    if (reserveSeatDto.seatNumber === 13) {
      throw new ConflictException('This seat is already reserved');
    }
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);
    return {
      reservationId:
        'mock_reservation_' + Math.random().toString(36).substr(2, 9),
      expiresAt: expiresAt.toISOString(),
    };
  }

  @Post('process-payment')
  @ApiOperation({ summary: '결제 처리' })
  @ApiBody({
    type: ProcessPaymentDto,
    description:
      '예약 ID가 "invalid"인 경우 유효하지 않은 예약으로 간주합니다. 예약 ID가 "duplicate"인 경우 결제 정보 생성 실패로 간주합니다.',
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token',
    required: true,
  })
  @ApiHeader({
    name: 'X-Mock-Token-Fail',
    required: false,
    description:
      '이 헤더가 "true"로 설정되면 토큰 검증 실패를 시뮬레이션합니다.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '결제 처리 성공',
    schema: {
      type: 'object',
      properties: {
        paymentId: { type: 'string' },
        status: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '토큰 검증 실패',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '유효한 예약 정보가 존재하지 않음',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: '결제 정보 생성 실패',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number' },
        message: { type: 'string' },
      },
    },
  })
  @ApiBearerAuth()
  processPayment(
    @Body() processPaymentDto: ProcessPaymentDto,
    @Headers('X-Mock-Token-Fail') mockFail: string,
  ) {
    if (mockFail === 'true') {
      throw new UnauthorizedException('Invalid or expired token');
    }
    if (processPaymentDto.reservationId === 'invalid') {
      throw new NotFoundException('Invalid reservation ID');
    }
    if (processPaymentDto.reservationId === 'duplicate') {
      throw new ConflictException(
        'Duplicate payment attempt. This reservation has already been paid for.',
      );
    }
    return {
      paymentId: 'mock_payment_' + Math.random().toString(36).substr(2, 9),
      status: 'completed',
    };
  }

  @Get('balance/:userId')
  @ApiOperation({ summary: '잔액 조회' })
  @ApiParam({
    name: 'userId',
    type: 'string',
    example: '12345',
    description:
      '조회할 사용자의 ID. "0"일 경우 User Not Exists 에러를 반환합니다.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '잔액 조회 성공',
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string' },
        balance: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '유저 정보가 존재하지 않음',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number' },
        message: { type: 'string' },
      },
    },
  })
  getBalance(@Param('userId') userId: string) {
    if (userId === '0') {
      throw new NotFoundException('User Not Exists');
    }
    // Mock response
    return {
      userId: userId,
      balance: Math.floor(Math.random() * 100000),
    };
  }

  @Post('charge-balance')
  @ApiOperation({ summary: '잔액 충전' })
  @ApiBody({
    type: ChargeBalanceDto,
    description: 'userId가 "0"일 경우 User Not Exists 에러를 반환합니다.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '잔액 충전 성공',
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string' },
        balance: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '유저 정보가 존재하지 않음',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number' },
        message: { type: 'string' },
      },
    },
  })
  chargeBalance(@Body() chargeBalanceDto: ChargeBalanceDto) {
    if (chargeBalanceDto.userId === '0') {
      throw new NotFoundException('User Not Exists');
    }
    return {
      userId: chargeBalanceDto.userId,
      balance: Math.floor(Math.random() * 100000) + chargeBalanceDto.amount,
    };
  }
}
