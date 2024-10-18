import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from 'src/constants/jwt';
import { QueueService } from 'src/domain/queue/service/queue.service';
import { TokenService } from 'src/domain/queue/service/token.service';
import { EnterQueueUsecase } from './enter-queue.usecase';
import { GetQueuePositionUsecase } from './get-queue-position.usecase';
import { SESSION_READER_REPOSITORY } from 'src/domain/queue/repository/session-reader.interface';
import { SessionReaderRepositoryImpl } from 'src/infra/persistence/session/session-reader.repository';
import { SESSION_WRITER_REPOSITORY } from 'src/domain/queue/repository/session-writer.interface';
import { SessionWriterRepositoryImpl } from 'src/infra/persistence/session/session-writer.repository';
import { SESSION_COUNTER_READER_REPOSITORY } from 'src/domain/queue/repository/session-counter-reader.interface';
import { SessionCounterReaderRepositoryImpl } from 'src/infra/persistence/session/session-counter-reader.repository';
import { SESSION_COUNTER_WRITER_REPOSITORY } from 'src/domain/queue/repository/session-counter-writer.interface';
import { SessionCounterWriterRepositoryImpl } from 'src/infra/persistence/session/session-counter-writer.repository';
import { QueueController } from 'src/api/queue/queue.controller';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1h' },
    }),
    UserModule,
  ],
  controllers: [QueueController],
  providers: [
    // services
    QueueService,
    TokenService,

    // usecases
    EnterQueueUsecase,
    GetQueuePositionUsecase,

    // repositories
    {
      provide: SESSION_READER_REPOSITORY,
      useClass: SessionReaderRepositoryImpl,
    },
    {
      provide: SESSION_WRITER_REPOSITORY,
      useClass: SessionWriterRepositoryImpl,
    },
    {
      provide: SESSION_COUNTER_READER_REPOSITORY,
      useClass: SessionCounterReaderRepositoryImpl,
    },
    {
      provide: SESSION_COUNTER_WRITER_REPOSITORY,
      useClass: SessionCounterWriterRepositoryImpl,
    },
  ],
  exports: [QueueService, TokenService],
})
export class QueueModule {}
