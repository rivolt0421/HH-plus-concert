import { Session } from '../entity/session';

export const SESSION_READER_REPOSITORY = Symbol('SESSION_READER_REPOSITORY');
export interface SessionReaderRepository {
  getByIdOrThrow(id: number): Promise<Session>;
}
