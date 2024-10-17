import { Injectable } from '@nestjs/common';
import { UserService } from 'src/domain/user/service/user.service';

@Injectable()
export class GetPointUsecase {
  constructor(private readonly userService: UserService) {}

  async execute(userId: number): Promise<number> {
    return this.userService.getPoint(userId);
  }
}
