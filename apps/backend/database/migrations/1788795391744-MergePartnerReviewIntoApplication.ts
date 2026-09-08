import { MigrationInterface, QueryRunner } from "typeorm";

export class MergePartnerReviewIntoApplication1788795391744 implements MigrationInterface {
    name = 'MergePartnerReviewIntoApplication1788795391744'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_partner_review_partner_id"`);
        await queryRunner.query(`CREATE INDEX "IDX_partner_application_partner_id" ON "partner_review"  ("partner_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_partner_application_partner_id"`);
        await queryRunner.query(`CREATE INDEX "IDX_partner_review_partner_id" ON "partner_review" USING btree ("partner_id") `);
    }

}
