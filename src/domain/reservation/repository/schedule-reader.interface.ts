import { Schedule } from '../entity/schedule';

export const SCHEDULE_READER_REPOSITORY = Symbol('SCHEDULE_READER_REPOSITORY');
export interface ScheduleReaderRepository {
  findByDateOrThrow(date: string): Promise<Schedule>;
  findAllDates(): Promise<string[]>;
}
