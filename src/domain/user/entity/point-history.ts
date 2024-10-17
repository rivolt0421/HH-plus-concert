export type PointHistory = {
  id: number;
  userId: number;
  amount: number;
  type: 'CHARGE' | 'USE';
  createdAt: Date;
};
