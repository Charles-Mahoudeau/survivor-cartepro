import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '@/modules/payments/core/entities/payment.entity';
import type { PaymentStatus } from '@/modules/payments/core/enums/payment-status.enum';

/** One payment as the export reads it: the employee behind the wallet, the partner, the outcome. */
export interface TransactionRow {
  id: string;
  createdAt: Date;
  employeeId: string;
  partnerId: string;
  /** As Postgres returns a `numeric`: a decimal string, never a float. */
  amount: string;
  status: PaymentStatus;
}

@Injectable()
export class TransactionRepo {
  constructor(
    @InjectRepository(Payment)
    private readonly payments: Repository<Payment>,
  ) {}

  /**
   * Every payment, validated or refused, oldest first. The id is a UUIDv7, so
   * ordering on it is ordering on time, and two reads yield the same lines in
   * the same order.
   */
  findAllForExport(): Promise<TransactionRow[]> {
    return this.payments
      .createQueryBuilder('payment')
      .innerJoin('payment.wallet', 'wallet')
      .innerJoin('wallet.user', 'employee')
      .innerJoin('payment.partner', 'partner')
      .select('payment.id', 'id')
      .addSelect('payment.createdAt', 'createdAt')
      .addSelect('employee.id', 'employeeId')
      .addSelect('partner.id', 'partnerId')
      .addSelect('payment.amount', 'amount')
      .addSelect('payment.status', 'status')
      .orderBy('payment.id', 'ASC')
      .getRawMany<TransactionRow>();
  }
}
