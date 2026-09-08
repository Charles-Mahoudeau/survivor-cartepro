import { Module } from '@nestjs/common';
import { CollectModule } from '@/modules/payments/collect';
import { PaymentsCoreModule } from '@/modules/payments/core';
import { TransactionsModule } from '@/modules/payments/transactions';

@Module({
  imports: [PaymentsCoreModule, TransactionsModule, CollectModule],
})
export class PaymentsModule {}
