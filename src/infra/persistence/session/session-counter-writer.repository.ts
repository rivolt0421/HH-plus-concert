import { PrismaService } from 'src/database/prisma.service';
import { SessionCounterWriterRepository } from 'src/domain/session/repository/session-counter-writer.interface';

export class SessionCounterWriterRepositoryImpl
  implements SessionCounterWriterRepository
{
  constructor(private readonly prisma: PrismaService) {}

  increaseCreatedCount(): Promise<number> {
    return (this.prisma.getTx() ?? this.prisma).sessionCounter
      .update({
        where: { id: 1 },
        data: { createdCount: { increment: 1 } },
      })
      .then((sessionCounter) => sessionCounter.createdCount);
  }

  increaseTerminatedCount(): Promise<number> {
    return (this.prisma.getTx() ?? this.prisma).sessionCounter
      .update({
        where: { id: 1 },
        data: { terminatedCount: { increment: 1 } },
      })
      .then((sessionCounter) => sessionCounter.terminatedCount);
  }
}
