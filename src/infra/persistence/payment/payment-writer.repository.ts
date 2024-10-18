import { PaymentWriterRepository } from 'src/domain/payment/repository/payment-writer.interface';
import { PrismaService } from 'src/database/prisma.service';
import { Payment } from 'src/domain/payment/entity/payment';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PaymentWriterRepositoryImpl implements PaymentWriterRepository {
  constructor(private readonly prisma: PrismaService) {}
  async save(payment: Omit<Payment, 'id'>): Promise<Payment> {
    return (this.prisma.getTx() ?? this.prisma).payment
      .create({
        data: {
          ...payment,
        },
      })
      .then((p) => ({
        id: p.id,
        amount: p.amount,
        status: p.status as Payment['status'],
        paidAt: p.paidAt,
      }));
  }
}
