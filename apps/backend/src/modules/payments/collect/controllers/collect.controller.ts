import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { ROLES } from '@/config/auth/auth.constants';
import type { AuthUser } from '@/config/auth/auth';
import { CollectPaymentDoc } from '../docs';
import { CollectService } from '../services/collect.service';
import {
  CollectPaymentDto,
  type PaymentReceiptResponseDto,
} from '../validators';

@ApiTags('Payments')
@Controller('payments')
export class CollectController {
  constructor(private readonly collectService: CollectService) {}

  @Post()
  @Roles(ROLES.PARTNER)
  @CollectPaymentDoc()
  collect(
    @CurrentUser() user: AuthUser,
    @Body() body: CollectPaymentDto,
  ): Promise<PaymentReceiptResponseDto> {
    return this.collectService.collectForOwner(user.id, body);
  }
}
