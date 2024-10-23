import { Injectable } from '@nestjs/common';
import { QueueService } from 'src/domain/queue/service/queue.service';

@Injectable()
export class GetQueuePositionUsecase {
  constructor(private readonly queueService: QueueService) {}

  async execute(sessionId: number): Promise<number> {
    return this.queueService.getRemainingCountOf(sessionId);
  }
}
