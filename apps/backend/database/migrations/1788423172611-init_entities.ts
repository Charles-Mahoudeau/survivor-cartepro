import { MigrationInterface, QueryRunner } from "typeorm";

export class InitEntities1788423172611 implements MigrationInterface {
    name = 'InitEntities1788423172611'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "partner_category" ("slug" text NOT NULL, "display_name" text NOT NULL, CONSTRAINT "PK_7215da3aa69e553bbe934c13209" PRIMARY KEY ("slug"))`);
        await queryRunner.query(`CREATE TYPE "public"."partner_status_enum" AS ENUM('pending', 'active', 'refused', 'banned')`);
        await queryRunner.query(`CREATE TABLE "partner_review" ("id" uuid NOT NULL DEFAULT uuidv7(), "from_status" "public"."partner_status_enum" NOT NULL, "to_status" "public"."partner_status_enum" NOT NULL, "reason" text NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "partner_id" uuid NOT NULL, "decided_by" uuid NOT NULL, CONSTRAINT "PK_a39252bce9be48bf22ef3041873" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_partner_review_partner_id" ON "partner_review"  ("partner_id") `);
        await queryRunner.query(`CREATE TYPE "public"."payment_token_status_enum" AS ENUM('live', 'consumed', 'revoked')`);
        await queryRunner.query(`CREATE TABLE "payment_token" ("id" uuid NOT NULL DEFAULT uuidv7(), "short_code" character(8) NOT NULL, "status" "public"."payment_token_status_enum" NOT NULL DEFAULT 'live', "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "consumed_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "wallet_id" uuid NOT NULL, CONSTRAINT "PK_dd7d291c180f33c6ed2b707c179" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_e0929abab7954045fa56b68db7" ON "payment_token"  ("short_code") WHERE "status" = 'live'`);
        await queryRunner.query(`CREATE INDEX "IDX_payment_token_wallet_id" ON "payment_token"  ("wallet_id") `);
        await queryRunner.query(`CREATE TYPE "public"."wallet_status_enum" AS ENUM('active', 'disabled')`);
        await queryRunner.query(`CREATE TABLE "wallet" ("id" uuid NOT NULL DEFAULT uuidv7(), "employee_ref" text, "balance" numeric(12,2) NOT NULL DEFAULT '0', "currency" character(3) NOT NULL DEFAULT 'EUR', "status" "public"."wallet_status_enum" NOT NULL DEFAULT 'active', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, "employer_id" uuid, CONSTRAINT "CHK_wallet_balance_non_negative" CHECK (balance >= 0), CONSTRAINT "PK_bec464dd8d54c39c54fd32e2334" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_wallet_employer_employee_ref" ON "wallet"  ("employer_id", "employee_ref") WHERE "employer_id" IS NOT NULL AND "employee_ref" IS NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_wallet_user_employer" ON "wallet"  ("user_id", "employer_id") WHERE "employer_id" IS NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_wallet_employer_id" ON "wallet"  ("employer_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_wallet_user_id" ON "wallet"  ("user_id") `);
        await queryRunner.query(`CREATE TYPE "public"."wallet_entry_direction_enum" AS ENUM('credit', 'debit')`);
        await queryRunner.query(`CREATE TYPE "public"."wallet_entry_kind_enum" AS ENUM('payment_sent', 'payment_received', 'refund_sent', 'refund_received')`);
        await queryRunner.query(`CREATE TABLE "wallet_entry" ("id" uuid NOT NULL DEFAULT uuidv7(), "direction" "public"."wallet_entry_direction_enum" NOT NULL, "amount" numeric(12,2) NOT NULL, "balance_after" numeric(12,2) NOT NULL, "kind" "public"."wallet_entry_kind_enum" NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "wallet_id" uuid NOT NULL, "payment_id" uuid, "allocation_id" uuid, CONSTRAINT "CHK_wallet_entry_amount_positive" CHECK (amount > 0), CONSTRAINT "PK_bbe01e358e16f9671488ec458bd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_wallet_entry_allocation_id" ON "wallet_entry"  ("allocation_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_wallet_entry_payment_id" ON "wallet_entry"  ("payment_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_wallet_entry_wallet_id" ON "wallet_entry"  ("wallet_id") `);
        await queryRunner.query(`CREATE TYPE "public"."payment_capture_mode_enum" AS ENUM('qr_code', 'manual_code')`);
        await queryRunner.query(`CREATE TABLE "payment" ("id" uuid NOT NULL DEFAULT uuidv7(), "amount" numeric(12,2) NOT NULL, "capture_mode" "public"."payment_capture_mode_enum" NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "wallet_id" uuid NOT NULL, "partner_id" uuid NOT NULL, "payment_token_id" uuid NOT NULL, CONSTRAINT "REL_f5bee89d475347000913172cc9" UNIQUE ("payment_token_id"), CONSTRAINT "CHK_payment_amount_positive" CHECK (amount > 0), CONSTRAINT "PK_fcaec7df5adf9cac408c686b2ab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_payment_partner_id" ON "payment"  ("partner_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_payment_wallet_id" ON "payment"  ("wallet_id") `);
        // Created twice in the migration, we created it few lines higher.
        // await queryRunner.query(`CREATE TYPE "public"."partner_status_enum" AS ENUM('pending', 'active', 'refused', 'banned')`);
        await queryRunner.query(`CREATE TABLE "partner" ("id" uuid NOT NULL DEFAULT uuidv7(), "legal_name" text NOT NULL, "trade_name" text NOT NULL, "siren" character(9) NOT NULL, "business_purpose" text NOT NULL, "status" "public"."partner_status_enum" NOT NULL DEFAULT 'pending', "address_line" text NOT NULL, "postal_code" text NOT NULL, "city" text NOT NULL, "latitude" numeric(9,6) NOT NULL, "longitude" numeric(9,6) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "owner_id" uuid NOT NULL, CONSTRAINT "UQ_446e72eaf26f806375d832fe897" UNIQUE ("siren"), CONSTRAINT "REL_0c34acbc91d4ac6b200969f5ff" UNIQUE ("owner_id"), CONSTRAINT "PK_8f34ff11ddd5459eacbfacd48ca" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuidv7(), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "allocation" ("id" uuid NOT NULL DEFAULT uuidv7(), "label" text NOT NULL, "amount" numeric(12,2) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "employer_id" uuid NOT NULL, "created_by" uuid NOT NULL, CONSTRAINT "CHK_allocation_amount_positive" CHECK (amount > 0), CONSTRAINT "PK_7df89c736595e454b6ae07264fe" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_allocation_employer_id" ON "allocation"  ("employer_id") `);
        await queryRunner.query(`CREATE TABLE "employer" ("id" uuid NOT NULL DEFAULT uuidv7(), "name" text NOT NULL, "siren" character(9) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "owner_id" uuid NOT NULL, CONSTRAINT "UQ_95346ec42017cacb95daaf228bc" UNIQUE ("siren"), CONSTRAINT "REL_22c9394e151d0c9a9f81a56304" UNIQUE ("owner_id"), CONSTRAINT "PK_74029e6b1f17a4c7c66d43cfd34" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "partner_to_category" ("partner_id" uuid NOT NULL, "category_slug" text NOT NULL, CONSTRAINT "PK_3c5a4dce278726dca0eea386ae8" PRIMARY KEY ("partner_id", "category_slug"))`);
        await queryRunner.query(`CREATE INDEX "IDX_7caabe483ddd70a09fa83da6ee" ON "partner_to_category"  ("partner_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_a6d8550715cd3df77bd7f8e9db" ON "partner_to_category"  ("category_slug") `);
        await queryRunner.query(`ALTER TABLE "partner_review" ADD CONSTRAINT "FK_3353daa90b9785f631c5d490815" FOREIGN KEY ("partner_id") REFERENCES "partner"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "partner_review" ADD CONSTRAINT "FK_fec4f9c631164d8d96c18bda44b" FOREIGN KEY ("decided_by") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment_token" ADD CONSTRAINT "FK_173746812c601aedeab25486aaf" FOREIGN KEY ("wallet_id") REFERENCES "wallet"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wallet" ADD CONSTRAINT "FK_72548a47ac4a996cd254b082522" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wallet" ADD CONSTRAINT "FK_58cc395de106621663e30ffb770" FOREIGN KEY ("employer_id") REFERENCES "employer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wallet_entry" ADD CONSTRAINT "FK_702f6c2c2b5850bb8ce27185bc1" FOREIGN KEY ("wallet_id") REFERENCES "wallet"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wallet_entry" ADD CONSTRAINT "FK_c8b8730e0016518b83eb8e7addb" FOREIGN KEY ("payment_id") REFERENCES "payment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wallet_entry" ADD CONSTRAINT "FK_24d790c5df9a97a04c838165797" FOREIGN KEY ("allocation_id") REFERENCES "allocation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment" ADD CONSTRAINT "FK_373d2571be47c2edb437c6e5a51" FOREIGN KEY ("wallet_id") REFERENCES "wallet"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment" ADD CONSTRAINT "FK_3792a4d4fca9f63ffa272969e10" FOREIGN KEY ("partner_id") REFERENCES "partner"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment" ADD CONSTRAINT "FK_f5bee89d475347000913172cc9c" FOREIGN KEY ("payment_token_id") REFERENCES "payment_token"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "partner" ADD CONSTRAINT "FK_0c34acbc91d4ac6b200969f5ff6" FOREIGN KEY ("owner_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "allocation" ADD CONSTRAINT "FK_4340bb454146e26030cad695967" FOREIGN KEY ("employer_id") REFERENCES "employer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "allocation" ADD CONSTRAINT "FK_3e7ead3d5814baf50aae8f6c5f9" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employer" ADD CONSTRAINT "FK_22c9394e151d0c9a9f81a563044" FOREIGN KEY ("owner_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "partner_to_category" ADD CONSTRAINT "FK_7caabe483ddd70a09fa83da6eee" FOREIGN KEY ("partner_id") REFERENCES "partner"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "partner_to_category" ADD CONSTRAINT "FK_a6d8550715cd3df77bd7f8e9db2" FOREIGN KEY ("category_slug") REFERENCES "partner_category"("slug") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "partner_to_category" DROP CONSTRAINT "FK_a6d8550715cd3df77bd7f8e9db2"`);
        await queryRunner.query(`ALTER TABLE "partner_to_category" DROP CONSTRAINT "FK_7caabe483ddd70a09fa83da6eee"`);
        await queryRunner.query(`ALTER TABLE "employer" DROP CONSTRAINT "FK_22c9394e151d0c9a9f81a563044"`);
        await queryRunner.query(`ALTER TABLE "allocation" DROP CONSTRAINT "FK_3e7ead3d5814baf50aae8f6c5f9"`);
        await queryRunner.query(`ALTER TABLE "allocation" DROP CONSTRAINT "FK_4340bb454146e26030cad695967"`);
        await queryRunner.query(`ALTER TABLE "partner" DROP CONSTRAINT "FK_0c34acbc91d4ac6b200969f5ff6"`);
        await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "FK_f5bee89d475347000913172cc9c"`);
        await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "FK_3792a4d4fca9f63ffa272969e10"`);
        await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "FK_373d2571be47c2edb437c6e5a51"`);
        await queryRunner.query(`ALTER TABLE "wallet_entry" DROP CONSTRAINT "FK_24d790c5df9a97a04c838165797"`);
        await queryRunner.query(`ALTER TABLE "wallet_entry" DROP CONSTRAINT "FK_c8b8730e0016518b83eb8e7addb"`);
        await queryRunner.query(`ALTER TABLE "wallet_entry" DROP CONSTRAINT "FK_702f6c2c2b5850bb8ce27185bc1"`);
        await queryRunner.query(`ALTER TABLE "wallet" DROP CONSTRAINT "FK_58cc395de106621663e30ffb770"`);
        await queryRunner.query(`ALTER TABLE "wallet" DROP CONSTRAINT "FK_72548a47ac4a996cd254b082522"`);
        await queryRunner.query(`ALTER TABLE "payment_token" DROP CONSTRAINT "FK_173746812c601aedeab25486aaf"`);
        await queryRunner.query(`ALTER TABLE "partner_review" DROP CONSTRAINT "FK_fec4f9c631164d8d96c18bda44b"`);
        await queryRunner.query(`ALTER TABLE "partner_review" DROP CONSTRAINT "FK_3353daa90b9785f631c5d490815"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a6d8550715cd3df77bd7f8e9db"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7caabe483ddd70a09fa83da6ee"`);
        await queryRunner.query(`DROP TABLE "partner_to_category"`);
        await queryRunner.query(`DROP TABLE "employer"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_allocation_employer_id"`);
        await queryRunner.query(`DROP TABLE "allocation"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "partner"`);
        // Created twice in the migration, we drop it few lines below.
        // await queryRunner.query(`DROP TYPE "public"."partner_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_payment_wallet_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_payment_partner_id"`);
        await queryRunner.query(`DROP TABLE "payment"`);
        await queryRunner.query(`DROP TYPE "public"."payment_capture_mode_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_wallet_entry_wallet_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_wallet_entry_payment_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_wallet_entry_allocation_id"`);
        await queryRunner.query(`DROP TABLE "wallet_entry"`);
        await queryRunner.query(`DROP TYPE "public"."wallet_entry_kind_enum"`);
        await queryRunner.query(`DROP TYPE "public"."wallet_entry_direction_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_wallet_user_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_wallet_employer_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_wallet_user_employer"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_wallet_employer_employee_ref"`);
        await queryRunner.query(`DROP TABLE "wallet"`);
        await queryRunner.query(`DROP TYPE "public"."wallet_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_payment_token_wallet_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e0929abab7954045fa56b68db7"`);
        await queryRunner.query(`DROP TABLE "payment_token"`);
        await queryRunner.query(`DROP TYPE "public"."payment_token_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_partner_review_partner_id"`);
        await queryRunner.query(`DROP TABLE "partner_review"`);
        await queryRunner.query(`DROP TYPE "public"."partner_status_enum"`);
        await queryRunner.query(`DROP TABLE "partner_category"`);
    }

}
