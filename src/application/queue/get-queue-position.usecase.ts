import { Injectable } from '@nestjs/common';
import { QueueService } from 'src/domain/queue/service/queue.service';
import { TokenService } from 'src/domain/queue/service/token.service';

@Injectable()
export class GetQueuePositionUsecase {
  constructor(
    private readonly queueService: QueueService,
    private readonly tokenService: TokenService,
  ) {}

  async execute(token: string): Promise<number> {
    const sessionId = await this.tokenService.getSessionId(token);
    return this.queueService.getRemainingCountOf(sessionId);
  }
}
