import { PrismaService } from 'src/database/prisma.service';
import { SessionCounterWriterRepository } from 'src/domain/queue/repository/session-counter-writer.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
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
