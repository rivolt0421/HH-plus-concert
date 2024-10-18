import { User } from '../entity/user';

export const USER_READER_REPOSITORY = Symbol('USER_READER_REPOSITORY');
export interface UserReaderRepository {
  findByEmailAndPassword(email: string, password: string): Promise<User | null>;
}
