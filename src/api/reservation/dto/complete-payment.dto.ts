import { ApiProperty } from '@nestjs/swagger';

export class CompletePaymentReq {
  @ApiProperty({ example: 1, description: '예약 ID' })
  reservationId: number;

  @ApiProperty({ example: 1, description: '세션 ID' })
  sessionId: number;

  @ApiProperty({ example: 50000, description: '결제 금액' })
  amount: number;

  @ApiProperty({ example: 1714857600, description: '결제 일시' })
  paidAt: number;
}
export class CompletePaymentRes {
  @ApiProperty({ example: 1, description: '결제 ID' })
  paymentId: number;

  @ApiProperty({ example: 'PAID', description: '결제 상태' })
  status: string;
}
