import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from '@/modules/payments/core/entities/payment.entity';
import { TransactionController } from './controllers';
import { TransactionRepo } from './repos';
import { TransactionService } from './services';

/**
 * The payment history as the administration reads it: every payment, whatever
 * its outcome, as one exportable list. It owns no table — `Payment` belongs to
 * the payments core — only a read model over it.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Payment])],
  controllers: [TransactionController],
  providers: [TransactionRepo, TransactionService],
  exports: [TransactionService],
})
export class TransactionsModule {}
