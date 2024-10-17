export type Payment = {
  id: number;
  amount: number;
  status: 'PAID' | 'CANCELED';
  paidAt: Date;
};
