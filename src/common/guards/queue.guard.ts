import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { QueueService } from 'src/domain/queue/service/queue.service';
import { Request } from 'express';

@Injectable()
export class QueueGuard implements CanActivate {
  constructor(private readonly queueService: QueueService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const sessionId = request.sessionId;

    if (!sessionId) {
      throw new UnauthorizedException('Session ID not found');
    }

    const isAccessible = await this.queueService.isAccessible(sessionId);
    if (!isAccessible) {
      throw new UnauthorizedException('Not your turn yet');
    }

    return true;
  }
}
