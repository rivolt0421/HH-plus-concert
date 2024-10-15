import { User } from './user';

describe('유저 단위 테스트', () => {
  test('포인트를 사용할 때 잔액이 부족하면 에러가 발생한다.', () => {
    const user = new User(0, 'test@test.com', 'password', 100);
    expect(() => user.validatePointUse(110)).toThrow('Not enough point');
  });
});
