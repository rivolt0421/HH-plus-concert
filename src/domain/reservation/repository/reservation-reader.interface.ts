import { Reservation } from '../entity/reservation';

export const RESERVATION_READER_REPOSITORY = Symbol(
  'RESERVATION_READER_REPOSITORY',
);
export interface ReservationReaderRepository {
  findByIdOrThrow(id: number): Promise<Reservation>;
}
