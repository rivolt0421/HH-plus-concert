import { Reservation } from './reservation';
import { Seat } from './seat';

describe('좌석 단위 테스트', () => {
  const seatId = 1;
  const number = 1;
  const price = 10000;
  const version = 1;
  const futureDate = new Date(new Date().getTime() + 1000 * 60);

  test('좌석에 활성화된 예약이 하나라도 존재하는 경우, 해당 좌석은 점유된 상태이다.', () => {
    const reservations = [
      new Reservation(1, seatId, 1, new Date(), null, false),
      new Reservation(2, seatId, 1, futureDate, null, false),
      new Reservation(3, seatId, 1, new Date(), null, false),
    ];
    const seat = new Seat(seatId, number, price, reservations, version);

    expect(reservations.some((reservation) => reservation.isActive())).toBe(
      true,
    );
    expect(seat.isOccupied()).toBe(true);
  });

  test('좌석에 결제된 예약이 하나라도 존재하는 경우, 해당 좌석은 점유된 상태이다.', () => {
    const somePaymentId = 1;
    const reservations = [
      new Reservation(1, seatId, 1, new Date(), somePaymentId, false),
      new Reservation(2, seatId, 1, new Date(), null, false),
      new Reservation(3, seatId, 1, new Date(), null, false),
    ];
    const seat = new Seat(seatId, number, price, reservations, version);

    expect(reservations.some((reservation) => reservation.isPaid())).toBe(true);
    expect(seat.isOccupied()).toBe(true);
  });

  test('좌석에 이미 결제된 예약이 있으면, 해당 좌석에 대하여 특정 유저의 대기 중인 예약은 존재하지 않는다.', () => {
    const alreadyPaidReservation = new Reservation(
      1,
      seatId,
      1,
      new Date(),
      1,
      false,
    );
    const reservations = [
      alreadyPaidReservation,
      new Reservation(2, seatId, 2, new Date(), null, false),
      new Reservation(3, seatId, 3, new Date(), null, false),
    ];
    const seat = new Seat(seatId, number, price, reservations, version);

    expect(reservations.some((reservation) => reservation.isPaid())).toBe(true);
    expect(seat.getPendingReservationOf(1)).toBe(null);
    expect(seat.getPendingReservationOf(2)).toBe(null);
    expect(seat.getPendingReservationOf(3)).toBe(null);
  });

  test('좌석에 특정 유저의 활성화된 예약이 있으면, 해당 좌석에 대하여 다른 유저의 대기 중인 예약은 존재하지 않는다.', () => {
    const otherActiveReservation = new Reservation(
      2,
      seatId,
      2,
      futureDate,
      null,
      false,
    );
    const reservations = [
      new Reservation(1, seatId, 1, new Date(), null, false),
      otherActiveReservation,
      new Reservation(3, seatId, 3, new Date(), null, false),
    ];
    const seat = new Seat(seatId, number, price, reservations, version);

    expect(reservations.some((reservation) => reservation.isActive())).toBe(
      true,
    );
    expect(seat.getPendingReservationOf(1)).toBe(null);
    expect(seat.getPendingReservationOf(3)).toBe(null);
  });

  test('좌석에 특정 유저의 예약이 있더라도 그 예약이 결제 가능하지 않으면, 해당 좌석에 대하여 해당 유저의 대기 중인 예약은 존재하지 않는다.', () => {
    const notReadyForPaymentReservation = new Reservation(
      1,
      seatId,
      1,
      new Date(),
      null,
      true,
    );
    const seat = new Seat(
      seatId,
      number,
      price,
      [notReadyForPaymentReservation],
      version,
    );

    expect(notReadyForPaymentReservation.isReadyForPayment()).toBe(false);
    expect(seat.getPendingReservationOf(1)).toBe(null);
  });
});
