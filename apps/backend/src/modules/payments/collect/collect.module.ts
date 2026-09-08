import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from '@/modules/payments/core/entities/payment.entity';
import { PaymentTokenModule } from '@/modules/payments/payment-token/payment-token.module';
import { PartnersCoreModule } from '@/modules/partners/core';
import { WalletsModule } from '@/modules/wallets';
import { PaymentRepo } from './repos/payment.repo';
import { CollectService } from './services/collect.service';

/**
 * Owns no table of its own — `Payment` belongs to the payments core — only
 * the write path that turns a live token into a settled payment.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Payment]),
    PaymentTokenModule,
    PartnersCoreModule,
    WalletsModule,
  ],
  providers: [PaymentRepo, CollectService],
  exports: [CollectService],
})
export class CollectModule {}
