import { User } from '../entity/user';

export const USER_WRITER_REPOSITORY = Symbol('USER_WRITER_REPOSITORY');

export interface UserWriterRepository {
  incrementPoint(userId: number, amount: number): Promise<User | null>;
  /**
   * where 에 point gte amount 조건 추가 하고, (Read Committed 격리수준에서 보장해주도록)
   * atomic number operation 사용하는 걸로 하자.
   */
  decrementPoint(userId: number, amount: number): Promise<User | null>;
}
