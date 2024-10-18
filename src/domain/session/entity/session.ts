const A_MINUTE = 1000 * 60;

export class Session {
  static readonly durationTime = 10 * A_MINUTE;

  constructor(
    public readonly id: number,
    public readonly userId: number,
    public readonly waitingNumber: number,
    public readonly expiresAt: Date,
    public readonly createdAt: Date,
    private _isTerminated: boolean,
  ) {}

  static of(userId: number, waitingNumber: number) {
    const id = 0;
    const isTerminated = false;

    const now = new Date();
    const expiresAt = new Date(now.getTime() + Session.durationTime);
    const createdAt = now;

    return new Session(
      id,
      userId,
      waitingNumber,
      expiresAt,
      createdAt,
      isTerminated,
    );
  }

  get isTerminated(): boolean {
    return this._isTerminated;
  }

  isValid(): boolean {
    return this.expiresAt > new Date() && !this._isTerminated;
  }

  terminate(): void {
    this._isTerminated = true;
  }
}
