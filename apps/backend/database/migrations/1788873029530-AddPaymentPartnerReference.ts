import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPaymentPartnerReference1788873029530 implements MigrationInterface {
    name = 'AddPaymentPartnerReference1788873029530'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment" ADD "partner_reference" text`);
        await queryRunner.query(`CREATE INDEX "IDX_payment_created_at" ON "payment"  ("created_at") `);
        await queryRunner.query(`ALTER TABLE "payment" ADD CONSTRAINT "CHK_payment_partner_reference_not_blank" CHECK ((partner_reference IS NULL OR length(btrim(partner_reference)) > 0))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "CHK_payment_partner_reference_not_blank"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_payment_created_at"`);
        await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "partner_reference"`);
    }

}
