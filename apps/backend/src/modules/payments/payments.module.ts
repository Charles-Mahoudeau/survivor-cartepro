import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentToken } from '@/modules/payments/entities/payment-token.entity';
import { Payment } from '@/modules/payments/entities/payment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, PaymentToken])],
})
export class PaymentsModule {}
