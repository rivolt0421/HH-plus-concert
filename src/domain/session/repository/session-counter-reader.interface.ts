import { SessionCounter } from '../entity/counter';

export const SESSION_COUNTER_READER_REPOSITORY = Symbol(
  'SESSION_COUNTER_READER_REPOSITORY',
);
export interface SessionCounterReaderRepository {
  get(): Promise<SessionCounter>;
}
