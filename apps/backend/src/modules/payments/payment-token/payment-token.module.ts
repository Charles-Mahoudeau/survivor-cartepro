import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentToken } from '@/modules/payments/core/entities';
import { WalletsModule } from '@/modules/wallets';
import { PaymentTokenController } from './controllers';
import { ExpirePaymentTokensCron } from './cron/expire.cron';
import { PAYMENT_TOKEN_SOURCE } from './payment-token.contract';
import { PaymentTokenService } from './services';
import { SignedPaymentTokenService } from './services/helpers';
import { PaymentTokenRepo } from './repos/payment-token.repo';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentToken]), WalletsModule],
  controllers: [PaymentTokenController],
  providers: [
    SignedPaymentTokenService,
    PaymentTokenService,
    PaymentTokenRepo,
    {
      provide: PAYMENT_TOKEN_SOURCE,
      useExisting: SignedPaymentTokenService,
    },
    ExpirePaymentTokensCron,
  ],
  exports: [PAYMENT_TOKEN_SOURCE, PaymentTokenService],
})
export class PaymentTokenModule {}
