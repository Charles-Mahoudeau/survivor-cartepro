import { Injectable } from '@nestjs/common';
import { TransactionRepo } from '../repos/transaction.repo';
import { toTransactionsCsv } from './helpers/csv.helper';

@Injectable()
export class TransactionService {
  constructor(private readonly transactionRepo: TransactionRepo) {}

  /**
   * The whole history as one CSV document. The seed writes its file through
   * this very method, so the endpoint and the file cannot disagree by a byte.
   */
  async exportCsv(): Promise<string> {
    return toTransactionsCsv(await this.transactionRepo.findAllForExport());
  }
}
