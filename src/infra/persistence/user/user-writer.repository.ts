import { PrismaService } from 'src/database/prisma.service';
import { User } from 'src/domain/user/entity/user';
import { UserWriterRepository } from 'src/domain/user/repository/user-writer.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserWriterRepositoryImpl implements UserWriterRepository {
  constructor(private readonly prisma: PrismaService) {}
  incrementPoint(userId: number, amount: number): Promise<User | null> {
    return (this.prisma.getTx() ?? this.prisma).user
      .update({
        where: { id: userId },
        data: { point: { increment: amount } },
      })
      .then((user) => {
        return new User(user.id, user.email, user.password, user.point);
      });
  }

  /**
   * where 에 point gte amount 조건 추가 하고, (Read Committed 격리수준에서 보장해주도록)
   * atomic number operation 사용하는 걸로 하자.
   */
  decrementPoint(userId: number, amount: number): Promise<User | null> {
    return (this.prisma.getTx() ?? this.prisma).user
      .update({
        where: { id: userId, point: { gte: amount } },
        data: { point: { decrement: amount } },
      })
      .then((user) => {
        return new User(user.id, user.email, user.password, user.point);
      });
  }
}
