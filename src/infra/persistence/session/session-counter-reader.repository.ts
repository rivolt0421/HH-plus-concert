import { PrismaService } from 'src/database/prisma.service';
import { SessionCounter } from 'src/domain/queue/entity/counter';
import { SessionCounterReaderRepository } from 'src/domain/queue/repository/session-counter-reader.interface';
import { Injectable } from '@nestjs/common';
import { CatchPrismaNotFound } from 'src/common/decorators/catch-prisma.decorator';

@Injectable()
export class SessionCounterReaderRepositoryImpl
  implements SessionCounterReaderRepository
{
  constructor(private readonly prisma: PrismaService) {}

  @CatchPrismaNotFound('sessionCounter')
  async get(): Promise<SessionCounter> {
    return await (
      this.prisma.getTx() ?? this.prisma
    ).sessionCounter.findUniqueOrThrow({
      where: { id: 1 },
    });
  }
}
