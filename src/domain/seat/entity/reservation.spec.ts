import { Reservation } from './reservation';

describe('예약 정보 단위 테스트', () => {
  const id = 1;
  const seatId = 1;
  const userId = 1;
  const pastDate = new Date(new Date().getTime() - 1000 * 60);

  test('결제 정보가 존재하고 취소된 예약이 아니라면, 해당 예약은 결제된 예약이다.', () => {
    const paymentId = 1;
    const isCanceled = false;

    const reservation = new Reservation(
      id,
      seatId,
      userId,
      pastDate,
      paymentId,
      isCanceled,
    );

    expect(reservation.isPaid()).toBe(true);
  });

  test('임시 배정 기간이 지나지 않았고 취소된 예약이 아니라면, 활성화된 예약이다.', () => {
    const reservation = Reservation.of(seatId, userId);

    expect(reservation.isActive()).toBe(true);
  });

  test('결제 정보가 존재하지 않고 취소된 예약이 아니라면, 해당 예약은 결제 가능한 예약이다.', () => {
    const reservation = new Reservation(
      id,
      seatId,
      userId,
      pastDate,
      null,
      false,
    );

    expect(reservation.isReadyForPayment()).toBe(true);
  });
});
