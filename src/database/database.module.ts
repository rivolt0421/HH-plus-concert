import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { AsyncLocalStorage } from 'async_hooks';

@Global()
@Module({
  imports: [],
  providers: [
    PrismaService,
    {
      provide: AsyncLocalStorage,
      useValue: new AsyncLocalStorage(),
    },
  ],
  exports: [PrismaService],
})
export class DatabaseModule {}
