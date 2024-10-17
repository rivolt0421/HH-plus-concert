import { ApiProperty } from '@nestjs/swagger';
import { Seat } from 'src/domain/reservation/entity/seat';

export class GetAvailableSeatsRes {
  @ApiProperty({
    example: [
      {
        id: 1,
        number: 1,
        price: 10000,
      },
    ],
    description: '예약 가능한 좌석 정보',
  })
  seats: Pick<Seat, 'id' | 'number' | 'price'>[];

  constructor(seats: Seat[]) {
    this.seats = seats.map((seat) => ({
      id: seat.id,
      number: seat.number,
      price: seat.price,
    }));
  }
}
