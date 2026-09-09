import { Module } from '@nestjs/common';
import { WalletsModule } from '@/modules/wallets/wallets.module';
import { BalanceController } from './controllers';

/**
 * The third-party read of an employee balance. It owns no table and no repo:
 * it reads through the wallet service, so the balance a partner system sees
 * and the one the employee sees come off the same code path.
 */
@Module({
  imports: [WalletsModule],
  controllers: [BalanceController],
})
export class BalanceModule {}
