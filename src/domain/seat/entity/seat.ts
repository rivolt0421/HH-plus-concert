import { Reservation } from './reservation';

export class Seat {
  constructor(
    public readonly id: number,
    public readonly number: number,
    public readonly price: number,
    public readonly reservations: Reservation[],
    public readonly version: number,
  ) {}

  isOccupied(): boolean {
    return this.reservations.some(
      (reservation) => reservation.isActive() || reservation.isPaid(),
    );
  }

  getPendingReservationOf(userId: number): Reservation | null {
    const noPaid = this.reservations.every(
      (reservation) => !reservation.isPaid(),
    );
    if (!noPaid) {
      return null;
    }

    const noOtherActive = this.reservations.every((reservation) => {
      if (reservation.userId === userId) {
        return true;
      }
      return !reservation.isActive();
    });
    if (!noOtherActive) {
      return null;
    }

    const pendingReservation = this.reservations.find(
      (reservation) =>
        reservation.userId === userId && reservation.isReadyForPayment(),
    );

    return pendingReservation ?? null;
  }
}
