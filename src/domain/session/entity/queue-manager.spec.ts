import { QueueManager } from './queue-manager';

describe('대기열 매니저 단위 테스트', () => {
  test('대기 번호를 통해 해당 세션의 대기 순서를 확인할 수 있다.', () => {
    const terminatedCount = 5;
    const manager = new QueueManager(10, terminatedCount);
    const expectedCount = 12;
    const waitingNumber = manager.CAPACITY + terminatedCount + expectedCount;

    expect(manager.getRemainingCount(waitingNumber)).toBe(expectedCount);
  });

  test('대기 순서는 0보다 작을 수 없다.', () => {
    const terminatedCount = 10;
    const manager = new QueueManager(30, terminatedCount);
    const waitingNumber = manager.CAPACITY + terminatedCount - 5;

    expect(manager.getRemainingCount(waitingNumber)).toBe(0);
  });

  test('대기 순서가 0보다 작거나 같은 세션은 접속 가능한 상태이다.', () => {
    const manager = new QueueManager(30, 10);
    const waitingNumber = 90;

    expect(manager.getRemainingCount(waitingNumber)).toBe(0);
    expect(manager.isAccessible(waitingNumber)).toBe(true);
  });
});
