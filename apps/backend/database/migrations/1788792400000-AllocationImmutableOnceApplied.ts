import type { MigrationInterface, QueryRunner } from 'typeorm';

/** An allocation is never deleted, and freezes for good once it is applied. */
export class AllocationImmutableOnceApplied1788792400000
  implements MigrationInterface
{
  name = 'AllocationImmutableOnceApplied1788792400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TRIGGER "TRG_allocation_immutable" ON "allocation"`,
    );

    await queryRunner.query(`
      CREATE TRIGGER "TRG_allocation_immutable_once_applied"
      BEFORE UPDATE ON "allocation"
      FOR EACH ROW
      WHEN (OLD."status" = 'applied')
      EXECUTE FUNCTION prevent_money_table_mutation();
    `);

    await queryRunner.query(`
      CREATE TRIGGER "TRG_allocation_no_delete"
      BEFORE DELETE ON "allocation"
      FOR EACH ROW
      EXECUTE FUNCTION prevent_money_table_mutation();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TRIGGER "TRG_allocation_no_delete" ON "allocation"`,
    );
    await queryRunner.query(
      `DROP TRIGGER "TRG_allocation_immutable_once_applied" ON "allocation"`,
    );

    await queryRunner.query(`
      CREATE TRIGGER "TRG_allocation_immutable"
      BEFORE UPDATE OR DELETE ON "allocation"
      FOR EACH ROW
      EXECUTE FUNCTION prevent_money_table_mutation();
    `);
  }
}
