import { MigrationInterface, QueryRunner } from "typeorm";

export class PaymentStatusAndWalletOverdraft1788513862492 implements MigrationInterface {
    name = 'PaymentStatusAndWalletOverdraft1788513862492'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "wallet" DROP CONSTRAINT "CHK_wallet_balance_non_negative"`);
        await queryRunner.query(`CREATE TYPE "public"."payment_status_enum" AS ENUM('validated', 'refused')`);
        await queryRunner.query(`ALTER TABLE "payment" ADD "status" "public"."payment_status_enum" NOT NULL DEFAULT 'validated'`);
        await queryRunner.query(`ALTER TABLE "wallet" ADD CONSTRAINT "CHK_wallet_balance_within_overdraft" CHECK (balance >= -150)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "wallet" DROP CONSTRAINT "CHK_wallet_balance_within_overdraft"`);
        await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."payment_status_enum"`);
        await queryRunner.query(`ALTER TABLE "wallet" ADD CONSTRAINT "CHK_wallet_balance_non_negative" CHECK ((balance >= (0)::numeric))`);
    }

}
