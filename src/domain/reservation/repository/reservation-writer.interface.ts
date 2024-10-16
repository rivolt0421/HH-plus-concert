import { Reservation } from '../entity/reservation';

export const RESERVATION_WRITER_REPOSITORY = Symbol(
  'RESERVATION_WRITER_REPOSITORY',
);
export interface ReservationWriterRepository {
  saveWithSeatVersion(
    reservation: Omit<Reservation, 'id'>,
    seatVersion: number,
  ): Promise<Reservation | null>;
}
