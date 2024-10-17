import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as runtime from '@prisma/client/runtime/library.js';
import { AsyncLocalStorage } from 'async_hooks';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  public readonly errorCode = {
    RECORD_NOT_FOUND: 'P2025',
    UNIQUE_CONSTRAINT_FAILED: 'P2002',
  };

  constructor(private readonly als: AsyncLocalStorage<Store>) {
    super();
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async tx<R>(bizLogic: () => Promise<R>): Promise<R> {
    return this.$transaction<R>((tx) => {
      return this.als.run({ tx }, () => bizLogic());
    });
  }

  getTx() {
    return this.als.getStore()?.tx;
  }
}

export type Store = {
  tx: Omit<PrismaClient, runtime.ITXClientDenyList>;
};
