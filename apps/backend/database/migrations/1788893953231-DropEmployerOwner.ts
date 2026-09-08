import { MigrationInterface, QueryRunner } from "typeorm";

export class DropEmployerOwner1788893953231 implements MigrationInterface {
    name = 'DropEmployerOwner1788893953231'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employer" DROP CONSTRAINT "FK_22c9394e151d0c9a9f81a563044"`);
        await queryRunner.query(`ALTER TABLE "employer" DROP CONSTRAINT "REL_22c9394e151d0c9a9f81a56304"`);
        await queryRunner.query(`ALTER TABLE "employer" DROP COLUMN "owner_id"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employer" ADD "owner_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "employer" ADD CONSTRAINT "REL_22c9394e151d0c9a9f81a56304" UNIQUE ("owner_id")`);
        await queryRunner.query(`ALTER TABLE "employer" ADD CONSTRAINT "FK_22c9394e151d0c9a9f81a563044" FOREIGN KEY ("owner_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
