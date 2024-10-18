import { Reservation } from './reservation';
import { Schedule } from './schedule';
import { Seat } from './seat';

describe('스케줄 단위 테스트', () => {
  const futureDate = new Date(new Date().getTime() + 1000 * 60 * 60 * 24);
  test('선점되지 않은 좌석을 예약 가능한 좌석으로 반환한다.', () => {
    const schedule = new Schedule(1, '2024-01-01', [
      new Seat(1, 1, 10000, [], 0),
      new Seat(
        2,
        2,
        10000,
        [new Reservation(1, 2, 10, new Date(), 111, false)],
        0,
      ),
      new Seat(
        3,
        3,
        10000,
        [new Reservation(2, 3, 10, futureDate, null, false)],
        0,
      ),
    ]);
    expect(schedule.getAvailableSeats()).toHaveLength(1);
    expect(schedule.getAvailableSeats()[0].id).toBe(1);
  });
});
