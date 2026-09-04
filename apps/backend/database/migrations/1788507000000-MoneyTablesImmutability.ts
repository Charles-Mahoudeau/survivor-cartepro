import type { MigrationInterface, QueryRunner } from 'typeorm';

export class MoneyTablesImmutability1788507000000
  implements MigrationInterface
{
  name = 'MoneyTablesImmutability1788507000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION prevent_money_table_mutation()
      RETURNS trigger
      LANGUAGE plpgsql
      AS $$
      BEGIN
        RAISE EXCEPTION 'Immutable table "%" cannot be mutated with %', TG_TABLE_NAME, TG_OP
          USING ERRCODE = 'restrict_violation';
      END;
      $$;
    `);

    for (const tableName of ['payment', 'wallet_entry', 'allocation']) {
      await queryRunner.query(`
        CREATE TRIGGER "TRG_${tableName}_immutable"
        BEFORE UPDATE OR DELETE ON "${tableName}"
        FOR EACH ROW
        EXECUTE FUNCTION prevent_money_table_mutation();
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const tableName of ['payment', 'wallet_entry', 'allocation']) {
      await queryRunner.query(
        `DROP TRIGGER "TRG_${tableName}_immutable" ON "${tableName}"`,
      );
    }

    await queryRunner.query(
      'DROP FUNCTION prevent_money_table_mutation()',
    );
  }
}
