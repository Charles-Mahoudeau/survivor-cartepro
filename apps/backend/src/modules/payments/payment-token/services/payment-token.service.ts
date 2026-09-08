import { Inject, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import {
  PAYMENT_TOKEN_SOURCE,
  type PaymentTokenSource,
} from '../payment-token.contract';
import { PaymentTokenResponseDto } from '../validators';

@Injectable()
export class PaymentTokenService {
  constructor(
    @Inject(PAYMENT_TOKEN_SOURCE)
    private readonly paymentTokenSource: PaymentTokenSource,
  ) {}

  async issue(userId: string): Promise<PaymentTokenResponseDto> {
    return plainToInstance(
      PaymentTokenResponseDto,
      await this.paymentTokenSource.issue(userId),
    );
  }

  async getCurrent(userId: string): Promise<PaymentTokenResponseDto> {
    return plainToInstance(
      PaymentTokenResponseDto,
      await this.paymentTokenSource.getCurrent(userId),
    );
  }

  async revokeCurrent(userId: string): Promise<void> {
    return this.paymentTokenSource.revokeCurrent(userId);
  }
}
