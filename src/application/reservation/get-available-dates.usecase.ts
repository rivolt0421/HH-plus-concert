import { Injectable } from '@nestjs/common';
import { ScheduleService } from 'src/domain/reservation/service/schedule.service';

@Injectable()
export class GetAvailableDatesUsecase {
  constructor(private readonly scheduleService: ScheduleService) {}

  async execute() {
    return this.scheduleService.getAvailableDates();
  }
}
