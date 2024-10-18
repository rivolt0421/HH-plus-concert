import { User } from '../entity/user';

export const USER_READER_REPOSITORY = Symbol('USER_READER_REPOSITORY');
export interface UserReaderRepository {
  findByIdOrThrow(id: number): Promise<User>;
  findByEmailAndPasswordOrThrow(email: string, password: string): Promise<User>;
}
