import { Module } from '@nestjs/common';
import { PaymentsCoreModule } from '@/modules/payments/core';
import { TransactionsModule } from '@/modules/payments/transactions';

@Module({
  imports: [PaymentsCoreModule, TransactionsModule],
})
export class PaymentsModule {}
