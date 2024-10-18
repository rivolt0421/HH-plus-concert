import { PointHistory } from '../entity/point-history';

export const POINT_HISTORY_WRITER_REPOSITORY = Symbol(
  'POINT_HISTORY_WRITER_REPOSITORY',
);

export interface PointHistoryWriterRepository {
  save(pointHistory: Omit<PointHistory, 'id'>): Promise<PointHistory>;
}
