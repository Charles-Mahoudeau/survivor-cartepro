import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentToken } from '@/modules/payments/core/entities/payment-token.entity';
import { Payment } from '@/modules/payments/core/entities/payment.entity';
import { PaymentTokenModule } from '@/modules/payments/payment-token/payment-token.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, PaymentToken]),
    PaymentTokenModule,
  ],
})
export class PaymentsCoreModule {}
