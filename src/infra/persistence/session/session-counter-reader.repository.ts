import { PrismaService } from 'src/database/prisma.service';
import { SessionCounter } from 'src/domain/session/entity/counter';
import { SessionCounterReaderRepository } from 'src/domain/session/repository/session-counter-reader.interface';

export class SessionCounterReaderRepositoryImpl
  implements SessionCounterReaderRepository
{
  constructor(private readonly prisma: PrismaService) {}

  get(): Promise<SessionCounter> {
    return (
      this.prisma.getTx() ?? this.prisma
    ).sessionCounter.findUniqueOrThrow({
      where: { id: 1 },
    });
  }
}
