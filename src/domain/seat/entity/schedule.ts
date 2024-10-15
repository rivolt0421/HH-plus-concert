import { Seat } from './seat';

export class Schedule {
  constructor(
    public readonly id: number,
    public readonly date: string,
    public readonly seats: Seat[],
  ) {}

  getAvailableSeats(): Seat[] {
    return this.seats.filter((seat) => !seat.isOccupied());
  }
}
