import { MigrationInterface, QueryRunner } from "typeorm";

export class AllocationLifecycle1788792295124 implements MigrationInterface {
    name = 'AllocationLifecycle1788792295124'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."allocation_status_enum" AS ENUM('draft', 'applied')`);
        await queryRunner.query(`ALTER TABLE "allocation" ADD "status" "public"."allocation_status_enum" NOT NULL DEFAULT 'draft'`);
        await queryRunner.query(`ALTER TABLE "allocation" ADD "applied_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_wallet_entry_allocation_wallet" ON "wallet_entry"  ("allocation_id", "wallet_id") WHERE "allocation_id" IS NOT NULL`);
        await queryRunner.query(`ALTER TABLE "allocation" ADD CONSTRAINT "CHK_allocation_applied_at_matches_status" CHECK (("status" = 'applied') = ("applied_at" IS NOT NULL))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "allocation" DROP CONSTRAINT "CHK_allocation_applied_at_matches_status"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_wallet_entry_allocation_wallet"`);
        await queryRunner.query(`ALTER TABLE "allocation" DROP COLUMN "applied_at"`);
        await queryRunner.query(`ALTER TABLE "allocation" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."allocation_status_enum"`);
    }

}
