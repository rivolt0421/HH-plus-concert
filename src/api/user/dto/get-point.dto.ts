import { ApiProperty } from '@nestjs/swagger';

export class GetPointRes {
  @ApiProperty({ example: 50000, description: '포인트 잔액' })
  point: number;
}
