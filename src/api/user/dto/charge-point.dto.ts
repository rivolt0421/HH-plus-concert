import { ApiProperty } from '@nestjs/swagger';

export class ChargePointReq {
  @ApiProperty({ example: 12, description: '사용자 ID' })
  userId: number;

  @ApiProperty({ example: 50000, description: '충전 금액' })
  amount: number;
}
