import { MigrationInterface, QueryRunner } from "typeorm";

export class OneWalletPerEmployee1788894358309 implements MigrationInterface {
    name = 'OneWalletPerEmployee1788894358309'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_wallet_user_employer"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_wallet_user_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_wallet_user_no_employer"`);
        await queryRunner.query(`ALTER TABLE "wallet" DROP CONSTRAINT "FK_72548a47ac4a996cd254b082522"`);
        await queryRunner.query(`ALTER TABLE "wallet" ADD CONSTRAINT "UQ_72548a47ac4a996cd254b082522" UNIQUE ("user_id")`);
        await queryRunner.query(`ALTER TABLE "wallet" ADD CONSTRAINT "FK_72548a47ac4a996cd254b082522" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "wallet" DROP CONSTRAINT "FK_72548a47ac4a996cd254b082522"`);
        await queryRunner.query(`ALTER TABLE "wallet" DROP CONSTRAINT "UQ_72548a47ac4a996cd254b082522"`);
        await queryRunner.query(`ALTER TABLE "wallet" ADD CONSTRAINT "FK_72548a47ac4a996cd254b082522" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_wallet_user_no_employer" ON "wallet" USING btree ("user_id") WHERE (employer_id IS NULL)`);
        await queryRunner.query(`CREATE INDEX "IDX_wallet_user_id" ON "wallet" USING btree ("user_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_wallet_user_employer" ON "wallet" USING btree ("employer_id", "user_id") WHERE (employer_id IS NOT NULL)`);
    }

}
