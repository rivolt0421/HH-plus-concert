export const SESSION_COUNTER_WRITER_REPOSITORY = Symbol(
  'SESSION_COUNTER_WRITER_REPOSITORY',
);
export interface SessionCounterWriterRepository {
  increaseCreatedCount(): Promise<number>;
  increaseTerminatedCount(): Promise<number>;
}
