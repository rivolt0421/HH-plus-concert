import { ApiProperty } from '@nestjs/swagger';

export class GetQueuePositionRes {
  @ApiProperty({ example: 12, description: '내 앞에 몇 명 있는지' })
  remainingCount: number;
}
