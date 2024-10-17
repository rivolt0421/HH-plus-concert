import { BadRequestException, Injectable } from '@nestjs/common';
import { QueueService } from 'src/domain/queue/service/queue.service';
import { TokenService } from 'src/domain/queue/service/token.service';
import { ScheduleService } from 'src/domain/reservation/service/schedule.service';

@Injectable()
export class GetAvailableSeatsUsecase {
  constructor(
    private readonly scheduleService: ScheduleService,
    private readonly queueService: QueueService,
    private readonly tokenService: TokenService,
  ) {}

  async execute(date: string, token: string) {
    const sessionId = await this.tokenService.getSessionId(token);
    const isAccessible = await this.queueService.isAccessible(sessionId);
    if (!isAccessible) {
      throw new BadRequestException('Not your turn');
    }
    return this.scheduleService.getAvailableSeats(date);
  }
}
