import { Global, Module } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [
    PrismaService,
    {
      provide: AsyncLocalStorage,
      useValue: new AsyncLocalStorage(),
    },
    {
      provide: 'PrismaClientOptions',
      useValue: {},
    },
  ],
  exports: [PrismaService],
})
export class DatabaseModule {}
