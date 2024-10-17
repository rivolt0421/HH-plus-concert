export class QueueManager {
  readonly CAPACITY = 100;

  constructor(
    private readonly createdCount: number,
    private readonly terminatedCount: number,
  ) {}

  getRemainingCount(waitingNumber: number): number {
    const result = waitingNumber - (this.terminatedCount + this.CAPACITY);

    return result <= 0 ? 0 : result;
  }

  isAccessible(waitingNumber: number): boolean {
    return this.getRemainingCount(waitingNumber) <= 0;
  }
}
