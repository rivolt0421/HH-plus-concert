import { ApiProperty } from '@nestjs/swagger';

export class ReserveSeatReq {
  @ApiProperty({ example: '2023-05-01', description: '예약 날짜' })
  date: string;

  @ApiProperty({ example: 15, description: '좌석 번호' })
  seatNumber: number;
}
export class ReserveSeatRes {
  @ApiProperty({ example: 1, description: '예약 ID' })
  reservationId: number;
}
