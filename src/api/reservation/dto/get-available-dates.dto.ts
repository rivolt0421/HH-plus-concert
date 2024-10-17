import { ApiProperty } from '@nestjs/swagger';

export class GetAvailableDatesRes {
  @ApiProperty({
    example: ['2023-05-01', '2023-05-02', '2023-05-03'],
    description: '예약 가능한 날짜',
  })
  dates: string[];
}
