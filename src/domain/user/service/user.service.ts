import { ConflictException, Inject } from '@nestjs/common';
import { User } from '../entity/user';
import {
  POINT_HISTORY_WRITER_REPOSITORY,
  PointHistoryWriterRepository,
} from '../repository/point-history-writer.interface';
import {
  USER_READER_REPOSITORY,
  UserReaderRepository,
} from '../repository/user-reader.interface';
import {
  USER_WRITER_REPOSITORY,
  UserWriterRepository,
} from '../repository/user-writer.interface';

export class UserService {
  constructor(
    @Inject(USER_READER_REPOSITORY)
    private readonly userReader: UserReaderRepository,
    @Inject(USER_WRITER_REPOSITORY)
    private readonly userWriter: UserWriterRepository,
    @Inject(POINT_HISTORY_WRITER_REPOSITORY)
    private readonly pointHistoryWriter: PointHistoryWriterRepository,
  ) {}

  async findByEmailAndPassword(email: string, password: string): Promise<User> {
    const user = await this.userReader.findByEmailAndPasswordOrThrow(
      email,
      password,
    );

    return user;
  }

  async getPoint(userId: number): Promise<number> {
    const user = await this.userReader.findByIdOrThrow(userId);

    return user.point;
  }

  async chargePoint(userId: number, amount: number): Promise<User> {
    const user = await this.userReader.findByIdOrThrow(userId);

    await this.pointHistoryWriter.save({
      userId: user.id,
      amount,
      type: 'CHARGE',
      createdAt: new Date(),
    });
    const updatedUser = await this.userWriter.incrementPoint(user.id, amount);

    if (!updatedUser) {
      throw new ConflictException('User point update failed');
    }

    return updatedUser;
  }

  async usePoint(userId: number, amount: number): Promise<User> {
    const user = await this.userReader.findByIdOrThrow(userId);
    user.validatePointUse(amount);

    await this.pointHistoryWriter.save({
      userId: user.id,
      amount,
      type: 'USE',
      createdAt: new Date(),
    });
    const updatedUser = await this.userWriter.decrementPoint(user.id, amount);

    if (!updatedUser) {
      throw new ConflictException('User point update failed');
    }

    return updatedUser;
  }
}
