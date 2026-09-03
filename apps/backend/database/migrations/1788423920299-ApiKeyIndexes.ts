import { MigrationInterface, QueryRunner } from "typeorm";

export class ApiKeyIndexes1788423920299 implements MigrationInterface {
    name = 'ApiKeyIndexes1788423920299'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "IDX_e1ecbaeacf87ee61fe10c33140" ON "api_key"  ("config_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_fb080786c16de6ace7ed0b69f7" ON "api_key"  ("key") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_fb080786c16de6ace7ed0b69f7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e1ecbaeacf87ee61fe10c33140"`);
    }

}
