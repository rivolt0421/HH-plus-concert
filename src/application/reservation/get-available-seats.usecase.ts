import { Injectable } from '@nestjs/common';
import { ScheduleService } from 'src/domain/reservation/service/schedule.service';

@Injectable()
export class GetAvailableSeatsUsecase {
  constructor(private readonly scheduleService: ScheduleService) {}

  async execute(date: string) {
    return this.scheduleService.getAvailableSeats(date);
  }
}
