export class User {
  constructor(
    public readonly id: number,
    public readonly email: string,
    private readonly password: string,
    private _point: number,
  ) {}

  get point(): number {
    return this._point;
  }

  validatePointUse(amount: number) {
    if (this._point < amount) {
      throw new Error('Not enough point');
    }
  }
}
