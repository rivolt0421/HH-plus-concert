import { Injectable } from '@nestjs/common';
import { QueueService } from 'src/domain/queue/service/queue.service';
import { TokenService } from 'src/domain/queue/service/token.service';
import { UserService } from 'src/domain/user/service/user.service';

@Injectable()
export class EnterQueueUsecase {
  constructor(
    private readonly userService: UserService,
    private readonly queueService: QueueService,
    private readonly tokenService: TokenService,
  ) {}

  async execute(email: string, password: string) {
    const user = await this.userService.findByEmailAndPassword(email, password);
    const session = await this.queueService.createSession(user.id);
    const token = this.tokenService.createToken(session.id);

    return token;
  }
}
