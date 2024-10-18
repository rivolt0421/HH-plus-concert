import { Session } from './session';

describe('세션 단위 테스트', () => {
  test('세션의 유효 기간이 초과하면, 유효하지 않은 세션이다.', () => {
    const pastDate = new Date(new Date().getTime() - 1000 * 60);
    const expiresAt = pastDate;
    const session = new Session(0, 0, 0, expiresAt, new Date(), false);

    expect(session.isValid()).toBe(false);
  });
  test('세션을 종료 처리할 수 있다.', () => {
    const session = Session.of(0, 0);
    session.terminate();
    expect(session.isTerminated).toBe(true);
  });
  test('세션이 종료 처리되었으면, 유효하지 않은 세션이다.', () => {
    const session = Session.of(0, 0);
    session.terminate();
    expect(session.isValid()).toBe(false);
  });
});
