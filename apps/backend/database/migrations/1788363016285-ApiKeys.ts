import { MigrationInterface, QueryRunner } from "typeorm";

export class ApiKeys1788363016285 implements MigrationInterface {
    name = 'ApiKeys1788363016285'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "api_key" ("id" uuid NOT NULL DEFAULT uuidv7(), "config_id" text NOT NULL DEFAULT 'default', "name" text, "key" text NOT NULL, "start" text, "prefix" text, "reference_id" text NOT NULL, "enabled" boolean DEFAULT true, "refill_interval" integer, "refill_amount" integer, "last_refill_at" TIMESTAMP WITH TIME ZONE, "remaining" integer, "rate_limit_enabled" boolean DEFAULT true, "rate_limit_time_window" integer DEFAULT '86400000', "rate_limit_max" integer DEFAULT '10', "request_count" integer DEFAULT '0', "last_request" TIMESTAMP WITH TIME ZONE, "expires_at" TIMESTAMP WITH TIME ZONE, "permissions" text, "metadata" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_b1bd840641b8acbaad89c3d8d11" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_3d78c51b8caa59b4b0aec8418d" ON "api_key"  ("reference_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_3d78c51b8caa59b4b0aec8418d"`);
        await queryRunner.query(`DROP TABLE "api_key"`);
    }

}
