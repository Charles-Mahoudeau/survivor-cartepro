import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAllocationReceivedWalletEntryKind1788506022249 implements MigrationInterface {
    name = 'AddAllocationReceivedWalletEntryKind1788506022249'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."wallet_entry_kind_enum" ADD VALUE 'allocation_received'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."wallet_entry_kind_enum_old" AS ENUM('payment_sent', 'payment_received', 'refund_sent', 'refund_received')`);
        await queryRunner.query(`ALTER TABLE "wallet_entry" ALTER COLUMN "kind" TYPE "public"."wallet_entry_kind_enum_old" USING "kind"::"text"::"public"."wallet_entry_kind_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."wallet_entry_kind_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."wallet_entry_kind_enum_old" RENAME TO "wallet_entry_kind_enum"`);
    }

}
