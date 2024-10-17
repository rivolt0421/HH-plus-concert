import { PrismaService } from 'src/database/prisma.service';
import { User } from 'src/domain/user/entity/user';
import { UserReaderRepository } from 'src/domain/user/repository/user-reader.interface';

export class UserReaderRepositoryImpl implements UserReaderRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByIdOrThrow(id: number): Promise<User> {
    return (this.prisma.getTx() ?? this.prisma).user
      .findUniqueOrThrow({ where: { id } })
      .then((user) => {
        return new User(user.id, user.email, user.password, user.point);
      });
  }
  findByEmailAndPasswordOrThrow(
    email: string,
    password: string,
  ): Promise<User> {
    return (this.prisma.getTx() ?? this.prisma).user
      .findFirstOrThrow({ where: { email, password } })
      .then((user) => {
        return new User(user.id, user.email, user.password, user.point);
      });
  }
}
