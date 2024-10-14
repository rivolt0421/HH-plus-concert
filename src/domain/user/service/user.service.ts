import { Inject, NotFoundException } from '@nestjs/common';
import {
  USER_READER_REPOSITORY,
  UserReaderRepository,
} from '../repository/reader.interface';
import { User } from '../entity/user';

export class UserService {
  constructor(
    @Inject(USER_READER_REPOSITORY)
    private readonly userReader: UserReaderRepository,
  ) {}

  async findByEmailAndPassword(email: string, password: string): Promise<User> {
    const user = await this.userReader.findByEmailAndPassword(email, password);

    if (!user) {
      throw new NotFoundException('User not exists');
    }

    return user;
  }
}
