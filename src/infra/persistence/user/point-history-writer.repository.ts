import { PrismaService } from 'src/database/prisma.service';
import { PointHistory } from 'src/domain/user/entity/point-history';
import { PointHistoryWriterRepository } from 'src/domain/user/repository/point-history-writer.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PointHistoryWriterRepositoryImpl
  implements PointHistoryWriterRepository
{
  constructor(private readonly prisma: PrismaService) {}

  save(pointHistory: Omit<PointHistory, 'id'>): Promise<PointHistory> {
    return (this.prisma.getTx() ?? this.prisma).pointHistory
      .create({
        data: pointHistory,
      })
      .then((pointHistory) => {
        return {
          id: pointHistory.id,
          userId: pointHistory.userId,
          amount: pointHistory.amount,
          type: pointHistory.type as PointHistory['type'],
          createdAt: pointHistory.createdAt,
        };
      });
  }
}
