import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { GetPointUsecase } from 'src/application/user/get-point.usecase';
import { ChargePointUsecase } from 'src/application/user/update-point.usecase';
import { ChargePointReq } from './dto/charge-point.dto';
import { GetPointRes } from './dto/get-point.dto';
import {
  ChargePointSwagger,
  GetPointSwagger,
} from './user.controller.decorator';

@Controller('user')
export class UserController {
  constructor(
    private readonly getPointUsecase: GetPointUsecase,
    private readonly chargePointUsecase: ChargePointUsecase,
  ) {}

  @Get(':userId/point')
  @GetPointSwagger()
  async getPoint(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<GetPointRes> {
    const point = await this.getPointUsecase.execute(userId);

    return { point };
  }

  @Patch(':userId/point')
  @ChargePointSwagger()
  async chargePoint(
    @Body() chargePointDto: ChargePointReq,
  ): Promise<GetPointRes> {
    const point = await this.chargePointUsecase.execute(
      chargePointDto.userId,
      chargePointDto.amount,
    );

    return { point };
  }
}
