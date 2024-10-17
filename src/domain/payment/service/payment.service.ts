import { Inject } from '@nestjs/common';

import { Payment } from '../entity/payment';
import {
  PAYMENT_WRITER_REPOSITORY,
  PaymentWriterRepository,
} from '../repository/payment-writer.interface';

export class PaymentService {
  constructor(
    @Inject(PAYMENT_WRITER_REPOSITORY)
    private readonly paymentWriter: PaymentWriterRepository,
  ) {}

  async createPaid(amount: number, paidAt: Date): Promise<Payment> {
    const payment: Payment = {
      id: 0,
      amount,
      status: 'PAID',
      paidAt,
    };

    return this.paymentWriter.save(payment);
  }
}
