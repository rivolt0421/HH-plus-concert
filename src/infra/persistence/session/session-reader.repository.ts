import { PrismaService } from 'src/database/prisma.service';
import { Session } from 'src/domain/session/entity/session';
import { SessionReaderRepository } from 'src/domain/session/repository/session-reader.interface';

export class SessionReaderRepositoryImpl implements SessionReaderRepository {
  constructor(private readonly prisma: PrismaService) {}

  getByIdOrThrow(id: number): Promise<Session> {
    return (this.prisma.getTx() ?? this.prisma).session
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
