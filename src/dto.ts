import { ApiProperty } from '@nestjs/swagger';

export class EnterQueueReq {
  @ApiProperty({ example: 12, description: '사용자 ID' })
  userId: number;
}
export class EnterQueueRes {
  @ApiProperty({ example: 'mock_token_abc123', description: '토큰' })
  token: string;

  @ApiProperty({ example: 12, description: '큐 번호' })
  queueNumber: number;
}

export class GetQueuePositionRes {
  @ApiProperty({ example: 12, description: '큐 번호' })
  remainingCount: number;

  @ApiProperty({ example: 12, description: '예상 대기 시간' })
  estimatedWaitTime: number;
}

export class GetAvailableDatesRes {
  @ApiProperty({
    example: ['2023-05-01', '2023-05-02', '2023-05-03'],
    description: '예약 가능한 날짜',
  })
  dates: string[];
}

export class GetAvailableSeatsRes {
  @ApiProperty({ example: [1, 2, 3], description: '예약 가능한 좌석 번호' })
  seats: number[];
}

export class ReserveSeatReq {
  @ApiProperty({ example: '2023-05-01', description: '예약 날짜' })
  date: string;

  @ApiProperty({ example: 15, description: '좌석 번호' })
  seatNumber: number;
}
export class ReserveSeatRes {
  @ApiProperty({ example: 'mock_reservation_abc123', description: '예약 ID' })
  reservationId: string;
}

export class ProcessPaymentReq {
  @ApiProperty({ example: 'mock_reservation_abc123', description: '예약 ID' })
  reservationId: string;

  @ApiProperty({ example: 50000, description: '결제 금액' })
  amount: number;
}
export class ProcessPaymentRes {
  @ApiProperty({ example: 'mock_payment_abc123', description: '결제 ID' })
  paymentId: string;

  @ApiProperty({ example: 'completed', description: '결제 상태' })
  status: string;
}

export class GetPointRes {
  @ApiProperty({ example: 12, description: '사용자 ID' })
  userId: number;

  @ApiProperty({ example: 50000, description: '포인트 잔액' })
  point: number;
}

export class ChargePointReq {
  @ApiProperty({ example: 12, description: '사용자 ID' })
  userId: number;

  @ApiProperty({ example: 50000, description: '충전 금액' })
  amount: number;
}
