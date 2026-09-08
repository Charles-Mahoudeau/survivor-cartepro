import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PaymentTokenRepo } from '../repos/payment-token.repo';

@Injectable()
export class ExpirePaymentTokensCron {
  constructor(private readonly paymentTokenRepo: PaymentTokenRepo) {}

  @Cron('0 */5 * * *') // Every 5 minutes
  async handleCron() {
    await this.paymentTokenRepo.deleteExpiredTokens();
  }
}
