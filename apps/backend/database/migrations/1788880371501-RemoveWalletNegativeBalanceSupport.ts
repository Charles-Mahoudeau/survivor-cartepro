import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveWalletNegativeBalanceSupport1788880371501 implements MigrationInterface {
    name = 'RemoveWalletNegativeBalanceSupport1788880371501'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "wallet" DROP CONSTRAINT "CHK_wallet_balance_within_overdraft"`);
        await queryRunner.query(`ALTER TABLE "wallet" ADD CONSTRAINT "CHK_wallet_balance_non_negative" CHECK (balance >= 0)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "wallet" DROP CONSTRAINT "CHK_wallet_balance_non_negative"`);
        await queryRunner.query(`ALTER TABLE "wallet" ADD CONSTRAINT "CHK_wallet_balance_within_overdraft" CHECK ((balance >= ('-150'::integer)::numeric))`);
    }

}
