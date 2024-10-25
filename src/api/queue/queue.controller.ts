import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { EnterQueueUsecase } from 'src/application/queue/enter-queue.usecase';
import { GetQueuePositionUsecase } from 'src/application/queue/get-queue-position.usecase';
import { EnterQueueReq, EnterQueueRes } from './dto/enter-queue.dto';
import { GetQueuePositionRes } from './dto/get-queue-position.dto';
import {
  EnterQueueSwagger,
  GetQueuePositionSwagger,
} from './queue.controller.decorator';
import { Request } from 'express';

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
    const remainingCount = await this.getQueuePositionUsecase.execute(
      req.sessionId,
    );

    return { remainingCount };
  }
}
