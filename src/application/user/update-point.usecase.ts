import { Injectable } from '@nestjs/common';
import { UserService } from 'src/domain/user/service/user.service';

@Injectable()
export class ChargePointUsecase {
  constructor(private readonly userService: UserService) {}

  async execute(userId: number, amount: number): Promise<number> {
    const updatedUser = await this.userService.chargePoint(userId, amount);

    return updatedUser.point;
  }
}
