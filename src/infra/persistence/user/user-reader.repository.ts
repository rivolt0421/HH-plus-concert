import { Injectable } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { CatchPrismaNotFound } from 'src/common/decorators/catch-prisma.decorator';
import { PrismaService } from 'src/database/prisma.service';
import { User } from 'src/domain/user/entity/user';
import { UserReaderRepository } from 'src/domain/user/repository/user-reader.interface';

@Injectable()
export class UserReaderRepositoryImpl implements UserReaderRepository {
  constructor(private readonly prisma: PrismaService) {}

  @CatchPrismaNotFound('user')
  async findByIdOrThrow(id: number): Promise<User> {
    return await (this.prisma.getTx() ?? this.prisma).user
      .findUniqueOrThrow({ where: { id } })
      .then((user) => {
        return new User(user.id, user.email, user.password, user.point);
      })
      .catch((error) => {
        console.log(error);
        console.log(error instanceof PrismaClientKnownRequestError);
        throw error;
      });
  }

  @CatchPrismaNotFound('user')
  async findByEmailAndPasswordOrThrow(
    email: string,
    password: string,
  ): Promise<User> {
    return await (this.prisma.getTx() ?? this.prisma).user
      .findFirstOrThrow({ where: { email, password } })
      .then((user) => {
        return new User(user.id, user.email, user.password, user.point);
      });
  }
}
