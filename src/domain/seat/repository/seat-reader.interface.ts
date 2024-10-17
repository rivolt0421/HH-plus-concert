import { Seat } from '../entity/seat';

export const SEAT_READER_REPOSITORY = Symbol('SEAT_READER_REPOSITORY');
export interface SeatReaderRepository {
  findByIdOrThrow(id: number): Promise<Seat>;
  findByDateAndSeatNumberOrThrow(date: Date, seatNumber: number): Promise<Seat>;
}
