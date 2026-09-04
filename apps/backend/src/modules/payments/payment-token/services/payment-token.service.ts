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

  issue(userId: string): PaymentTokenResponseDto {
    return plainToInstance(
      PaymentTokenResponseDto,
      this.paymentTokenSource.issue(userId),
    );
  }

  getCurrent(userId: string): PaymentTokenResponseDto {
    return plainToInstance(
      PaymentTokenResponseDto,
      this.paymentTokenSource.getCurrent(userId),
    );
  }
}
