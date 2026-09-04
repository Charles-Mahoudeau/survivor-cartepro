import { Module } from '@nestjs/common';
import { PaymentTokenController } from './controllers';
import { PAYMENT_TOKEN_SOURCE } from './payment-token.contract';
import { PaymentTokenService } from './services';
import { StaticPaymentTokenService } from './services/helpers';

@Module({
  controllers: [PaymentTokenController],
  providers: [
    StaticPaymentTokenService,
    PaymentTokenService,
    {
      provide: PAYMENT_TOKEN_SOURCE,
      useExisting: StaticPaymentTokenService,
    },
  ],
  exports: [PAYMENT_TOKEN_SOURCE, PaymentTokenService],
})
export class PaymentTokenModule {}
