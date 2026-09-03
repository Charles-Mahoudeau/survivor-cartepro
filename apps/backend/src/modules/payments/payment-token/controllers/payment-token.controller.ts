import { Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { ROLES } from '@/config/auth/auth.constants';
import type { AuthUser } from '@/config/auth/auth';
import { CreatePaymentTokenDoc, GetCurrentPaymentTokenDoc } from '../docs';
import { PaymentTokenResponseDto } from '../validators';
import { PaymentTokenService } from '../services';

@ApiTags('Payment Tokens')
@Controller('me/payment-tokens')
export class PaymentTokenController {
  constructor(private readonly paymentTokenService: PaymentTokenService) {}

  @Post()
  @Roles(ROLES.EMPLOYEE)
  @CreatePaymentTokenDoc()
  issue(@CurrentUser() user: AuthUser): PaymentTokenResponseDto {
    return this.paymentTokenService.issue(user.id);
  }

  @Get('current')
  @Roles(ROLES.EMPLOYEE)
  @GetCurrentPaymentTokenDoc()
  getCurrent(@CurrentUser() user: AuthUser): PaymentTokenResponseDto {
    return this.paymentTokenService.getCurrent(user.id);
  }
}
