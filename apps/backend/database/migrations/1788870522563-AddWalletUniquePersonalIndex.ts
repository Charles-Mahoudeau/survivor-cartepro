import { MigrationInterface, QueryRunner } from "typeorm";

export class AddWalletUniquePersonalIndex1788870522563 implements MigrationInterface {
    name = 'AddWalletUniquePersonalIndex1788870522563'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_wallet_user_no_employer" ON "wallet"  ("user_id") WHERE "employer_id" IS NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_wallet_user_no_employer"`);
    }

}
