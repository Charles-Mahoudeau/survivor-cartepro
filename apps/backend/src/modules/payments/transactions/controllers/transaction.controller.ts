import { Controller, Get, Header } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from '@/common/decorators/roles.decorator';
import { ROLES } from '@/config/auth/auth.constants';
import {
  TRANSACTIONS_CSV_CONTENT_DISPOSITION,
  TRANSACTIONS_CSV_CONTENT_TYPE,
} from '../constants';
import { ExportTransactionsCsvDoc } from '../docs';
import { TransactionService } from '../services/transaction.service';

@ApiTags('Transactions')
@Controller('admin')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get('transactions.csv')
  @Roles(ROLES.ADMIN)
  @Header('Content-Type', TRANSACTIONS_CSV_CONTENT_TYPE)
  @Header('Content-Disposition', TRANSACTIONS_CSV_CONTENT_DISPOSITION)
  @ExportTransactionsCsvDoc()
  exportCsv(): Promise<string> {
    return this.transactionService.exportCsv();
  }
}
