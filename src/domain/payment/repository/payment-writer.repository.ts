import { Payment } from '../entity/payment';

export const PAYMENT_WRITER_REPOSITORY = 'PAYMENT_WRITER_REPOSITORY';

export interface PaymentWriterRepository {
  save(payment: Payment): Promise<Payment>;
}
