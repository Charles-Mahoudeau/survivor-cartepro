import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

/**
 * Asks the database whether it is still answering.
 *
 * The statement is written out instead of built by the QueryBuilder, which is
 * the narrow exception the repository convention allows: there is no entity to
 * read here. The point is to take a connection out of the pool and get a row
 * back, which is what tells a dead pool apart from a live one — `isInitialized`
 * only remembers that a connection was opened once.
 */
@Injectable()
export class HealthRepo {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async isDatabaseReachable(): Promise<boolean> {
    try {
      await this.dataSource.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }
}
