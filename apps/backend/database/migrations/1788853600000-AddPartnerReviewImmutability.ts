import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPartnerReviewImmutability1788853600000
  implements MigrationInterface
{
  name = 'AddPartnerReviewImmutability1788853600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TRIGGER "TRG_partner_review_immutable"
      BEFORE UPDATE OR DELETE ON "partner_review"
      FOR EACH ROW
      EXECUTE FUNCTION prevent_money_table_mutation();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TRIGGER "TRG_partner_review_immutable" ON "partner_review"`,
    );
  }
}
