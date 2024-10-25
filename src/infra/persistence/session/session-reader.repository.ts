import { PrismaService } from 'src/database/prisma.service';
import { Session } from 'src/domain/queue/entity/session';
import { SessionReaderRepository } from 'src/domain/queue/repository/session-reader.interface';
import { Injectable } from '@nestjs/common';
import { CatchPrismaNotFound } from 'src/common/decorators/catch-prisma.decorator';

@Injectable()
export class SessionReaderRepositoryImpl implements SessionReaderRepository {
  constructor(private readonly prisma: PrismaService) {}

  @CatchPrismaNotFound('session')
  async getByIdOrThrow(id: number): Promise<Session> {
    return await (this.prisma.getTx() ?? this.prisma).session
      .findUniqueOrThrow({
        where: { id },
      })
      .then((session) => {
        return new Session(
          session.id,
          session.userId,
          session.waitingNumber,
          session.expiresAt,
          session.createdAt,
          session.isTerminated,
        );
      });
  }
}
