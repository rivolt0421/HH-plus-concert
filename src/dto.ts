import { ApiProperty } from '@nestjs/swagger';

export class CreateTokenDto {
  @ApiProperty({ example: '12345', description: '사용자 ID' })
  userId: string;
}

export class ReserveSeatDto {
  @ApiProperty({ example: '2023-05-01', description: '예약 날짜' })
  date: string;

  @ApiProperty({ example: 15, description: '좌석 번호' })
  seatNumber: number;
}

export class ProcessPaymentDto {
  @ApiProperty({ example: 'mock_reservation_abc123', description: '예약 ID' })
  reservationId: string;

  @ApiProperty({ example: 50000, description: '결제 금액' })
  amount: number;
}

export class ChargeBalanceDto {
  @ApiProperty({ example: '12345', description: '사용자 ID' })
  userId: string;

  @ApiProperty({ example: 50000, description: '충전 금액' })
  amount: number;
}
