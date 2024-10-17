import { Module } from '@nestjs/common';
import { UserService } from 'src/domain/user/service/user.service';
import { GetPointUsecase } from './get-point.usecase';
import { ChargePointUsecase } from './update-point.usecase';
import { USER_READER_REPOSITORY } from 'src/domain/user/repository/user-reader.interface';
import { UserReaderRepositoryImpl } from 'src/infra/persistence/user/user-reader.repository';
import { USER_WRITER_REPOSITORY } from 'src/domain/user/repository/user-writer.interface';
import { UserWriterRepositoryImpl } from 'src/infra/persistence/user/user-writer.repository';
import { POINT_HISTORY_WRITER_REPOSITORY } from 'src/domain/user/repository/point-history-writer.interface';
import { PointHistoryWriterRepositoryImpl } from 'src/infra/persistence/user/point-history-writer.repository';
import { UserController } from 'src/api/user/user.controller';

@Module({
  controllers: [UserController],
  providers: [
    // services,
    UserService,

    // usecases,
    GetPointUsecase,
    ChargePointUsecase,

    // repositories,
    {
      provide: USER_READER_REPOSITORY,
      useClass: UserReaderRepositoryImpl,
    },
    {
      provide: USER_WRITER_REPOSITORY,
      useClass: UserWriterRepositoryImpl,
    },
    {
      provide: POINT_HISTORY_WRITER_REPOSITORY,
      useClass: PointHistoryWriterRepositoryImpl,
    },
  ],
  exports: [UserService],
})
export class UserModule {}
