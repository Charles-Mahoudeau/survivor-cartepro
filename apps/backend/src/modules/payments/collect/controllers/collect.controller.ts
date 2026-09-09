import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Audited } from '@/modules/audit/decorators';
import { AuditAction } from '@/modules/audit/enums/audit-action.enum';
import { Roles } from '@/common/decorators/roles.decorator';
import { ROLES } from '@/config/auth/auth.constants';
import type { AuthUser } from '@/config/auth/auth';
import { CollectPaymentDoc } from '../docs';
import { CollectService } from '../services/collect.service';
import {
  CollectPaymentDto,
  type PaymentReceiptResponseDto,
} from '../validators';

/** A refused collection writes no payment row, so its entry has no target. */
const PAYMENT_TARGET_TYPE = 'payment';

@ApiTags('Payments')
@Controller('payments')
export class CollectController {
  constructor(private readonly collectService: CollectService) {}

  @Post()
  @Roles(ROLES.PARTNER)
  @Audited(AuditAction.TRANSACTION_APPROVED, PAYMENT_TARGET_TYPE, {
    failureAction: AuditAction.TRANSACTION_REFUSED,
    resolveTargetId: ({ result }) =>
      (result as PaymentReceiptResponseDto).paymentId,
  })
  @CollectPaymentDoc()
  collect(
    @CurrentUser() user: AuthUser,
    @Body() body: CollectPaymentDto,
  ): Promise<PaymentReceiptResponseDto> {
    return this.collectService.collectForOwner(user.id, body);
  }
}
