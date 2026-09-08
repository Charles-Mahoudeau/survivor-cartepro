import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PaymentTokenRepo } from '../repos/payment-token.repo';

@Injectable()
export class ExpirePaymentTokensCron {
  private readonly logger = new Logger(ExpirePaymentTokensCron.name);

  constructor(private readonly paymentTokenRepo: PaymentTokenRepo) {}

  @Cron(CronExpression.EVERY_5_MINUTES, { name: 'expire-payment-tokens' })
  async handleCron(): Promise<void> {
    try {
      await this.paymentTokenRepo.updateExpiredTokens();
    } catch (error) {
      this.logger.error('Failed to expire payment tokens', error);
    }
  }
}
