import { Session } from '../entity/session';

export const SESSION_WRITER_REPOSITORY = Symbol('SESSION_WRITER_REPOSITORY');
export interface SessionWriterRepository {
  save(session: Session): Promise<Session>;
}
