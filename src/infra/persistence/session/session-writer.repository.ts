import { PrismaService } from 'src/database/prisma.service';
import { Session } from 'src/domain/queue/entity/session';
import { SessionWriterRepository } from 'src/domain/queue/repository/session-writer.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SessionWriterRepositoryImpl implements SessionWriterRepository {
  constructor(private readonly prisma: PrismaService) {}

  save(session: Omit<Session, 'id'>): Promise<Session> {
    return (this.prisma.getTx() ?? this.prisma).session
      .create({
        data: {
          userId: session.userId,
          waitingNumber: session.waitingNumber,
          expiresAt: session.expiresAt,
          createdAt: session.createdAt,
          isTerminated: session.isTerminated,
        },
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
