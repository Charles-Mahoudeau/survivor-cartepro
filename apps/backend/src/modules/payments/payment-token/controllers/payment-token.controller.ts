import { Controller, Delete, Get, HttpCode, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { ROLES } from '@/config/auth/auth.constants';
import type { AuthUser } from '@/config/auth/auth';
import {
  CreatePaymentTokenDoc,
  GetCurrentPaymentTokenDoc,
  RevokeCurrentPaymentTokenDoc,
} from '../docs';
import { PaymentTokenResponseDto } from '../validators';
import { PaymentTokenService } from '../services';

@ApiTags('Payment Tokens')
@Controller('me/payment-tokens')
export class PaymentTokenController {
  constructor(private readonly paymentTokenService: PaymentTokenService) {}

  @Post()
  @Roles(ROLES.EMPLOYEE)
  @CreatePaymentTokenDoc()
  issue(@CurrentUser() user: AuthUser): Promise<PaymentTokenResponseDto> {
    return this.paymentTokenService.issue(user.id);
  }

  @Get('current')
  @Roles(ROLES.EMPLOYEE)
  @GetCurrentPaymentTokenDoc()
  getCurrent(@CurrentUser() user: AuthUser): Promise<PaymentTokenResponseDto> {
    return this.paymentTokenService.getCurrent(user.id);
  }

  @Delete('current')
  @Roles(ROLES.EMPLOYEE)
  @HttpCode(204)
  @RevokeCurrentPaymentTokenDoc()
  revokeCurrent(@CurrentUser() user: AuthUser): Promise<void> {
    return this.paymentTokenService.revokeCurrent(user.id);
  }
}
