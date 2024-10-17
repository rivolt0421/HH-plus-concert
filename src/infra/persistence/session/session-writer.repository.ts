import { PrismaService } from 'src/database/prisma.service';
import { Session } from 'src/domain/session/entity/session';
import { SessionWriterRepository } from 'src/domain/session/repository/session-writer.interface';

export class SessionWriterRepositoryImpl implements SessionWriterRepository {
  constructor(private readonly prisma: PrismaService) {}

  save(session: Omit<Session, 'id'>): Promise<Session> {
    return (this.prisma.getTx() ?? this.prisma).session
      .create({
        data: session,
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
