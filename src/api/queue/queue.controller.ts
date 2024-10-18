import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { EnterQueueUsecase } from 'src/application/queue/enter-queue.usecase';
import { GetQueuePositionUsecase } from 'src/application/queue/get-queue-position.usecase';
import { EnterQueueReq } from './dto/enter-queue.dto';
import {
  EnterQueueSwagger,
  GetQueuePositionSwagger,
} from './queue.controller.decorator';
import { EnterQueueRes } from './dto/enter-queue.dto';
import { GetQueuePositionRes } from './dto/get-queue-position.dto';

@Controller('queue')
export class QueueController {
  constructor(
    private readonly enterQueueUsecase: EnterQueueUsecase,
    private readonly getQueuePositionUsecase: GetQueuePositionUsecase,
  ) {}

  @Post('enter')
  @EnterQueueSwagger()
  async enterQueue(
    @Body() enterQueueDto: EnterQueueReq,
  ): Promise<EnterQueueRes> {
    const token = await this.enterQueueUsecase.execute(
      enterQueueDto.email,
      enterQueueDto.password,
    );

    return { token };
  }

  @Get('position')
  @GetQueuePositionSwagger()
  async getQueuePosition(@Req() req: Request): Promise<GetQueuePositionRes> {
    const token = this.extractTokenFromHeader(req);
    if (!token) {
      throw new UnauthorizedException('Invalid or expired token');
    }
    const remainingCount = await this.getQueuePositionUsecase.execute(token);

    return { remainingCount };
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.get('authorization');
    const [type, token] = authHeader?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
