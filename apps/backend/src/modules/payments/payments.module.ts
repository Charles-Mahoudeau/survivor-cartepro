import { Module } from '@nestjs/common';
import { PaymentsCoreModule } from '@/modules/payments/core';

@Module({
  imports: [PaymentsCoreModule],
})
export class PaymentsModule {}
