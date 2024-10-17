const A_MINUTE = 1000 * 60;
export class Reservation {
  static readonly temporaryAssignedTime = 10 * A_MINUTE;
  constructor(
    public readonly id: number,
    public readonly seatId: number,
    public readonly userId: number,
    public readonly expiresAt: Date,
    private _paymentId: number | null,
    public readonly isCanceled: boolean,
  ) {}

  static of(seatId: number, userId: number) {
    const id = 0;
    const isCanceled = false;

    const now = new Date();
    const expiresAt = new Date(
      now.getTime() + Reservation.temporaryAssignedTime,
    );
    const paymentId = null;

    return new Reservation(
      id,
      seatId,
      userId,
      expiresAt,
      paymentId,
      isCanceled,
    );
  }

  get paymentId(): number | null {
    return this._paymentId;
  }

  isActive(): boolean {
    return !this.isCanceled && new Date() < this.expiresAt;
  }

  isPaid(): boolean {
    return !this.isCanceled && this.paymentId !== null;
  }

  isReadyForPayment(): boolean {
    return !this.isCanceled && this.paymentId === null;
  }

  markAsPaid(paymentId: number): Reservation {
    this._paymentId = paymentId;

    return this;
  }
}
