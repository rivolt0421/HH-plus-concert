import { Inject } from '@nestjs/common';
import { Seat } from '../entity/seat';
import {
  SCHEDULE_READER_REPOSITORY,
  ScheduleReaderRepository,
} from '../repository/schedule-reader.interface';

export class ScheduleService {
  constructor(
    @Inject(SCHEDULE_READER_REPOSITORY)
    private readonly scheduleReader: ScheduleReaderRepository,
  ) {}

  getAvailableDates(): Promise<string[]> {
    return this.scheduleReader.findAllDates();
  }

  async getAvailableSeats(date: string): Promise<Seat[]> {
    const schedule = await this.scheduleReader.findByDate(date);
    return schedule.getAvailableSeats();
  }
}
