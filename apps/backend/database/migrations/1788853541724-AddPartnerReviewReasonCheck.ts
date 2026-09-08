import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPartnerReviewReasonCheck1788853541724 implements MigrationInterface {
    name = 'AddPartnerReviewReasonCheck1788853541724'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "partner_review" ADD CONSTRAINT "CHK_partner_review_reason_not_blank" CHECK (length(btrim(reason)) > 0)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "partner_review" DROP CONSTRAINT "CHK_partner_review_reason_not_blank"`);
    }

}
