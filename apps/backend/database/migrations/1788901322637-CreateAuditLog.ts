import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * The DB role the application itself connects as. Read at migration-run
 * time (not baked into the SQL string at generation time) so this stays
 * correct across environments that set a different `DATABASE_USER`.
 *
 * This REVOKE is DCL, not schema DDL: `db:generate` cannot produce it, and
 * adding it by hand here does not fall under the migrations rule that bars
 * hand-written schema DDL (CREATE/ALTER/DROP TABLE, etc.) — see
 * `.claude/rules/fix-process-migrations-via-db-generate.md`.
 */
const APPLICATION_DB_USER = process.env.DATABASE_USER ?? 'cartepro';

export class CreateAuditLog1788901322637 implements MigrationInterface {
    name = 'CreateAuditLog1788901322637'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."audit_log_action_enum" AS ENUM('account_created', 'account_updated', 'role_changed', 'partner_approved', 'partner_refused', 'allocation_applied', 'transaction_approved', 'transaction_refused', 'login_failed', 'admin_action')`);
        await queryRunner.query(`CREATE TABLE "audit_log" ("id" uuid NOT NULL DEFAULT uuidv7(), "occurred_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "actor_id" uuid, "actor_role" text, "action" "public"."audit_log_action_enum" NOT NULL, "target_type" text NOT NULL, "target_id" text, "payload" jsonb, "ip" text, "previous_hash" text, "hash" text NOT NULL, CONSTRAINT "PK_07fefa57f7f5ab8fc3f52b3ed0b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_audit_log_action" ON "audit_log"  ("action") `);
        await queryRunner.query(`CREATE INDEX "IDX_audit_log_actor_id" ON "audit_log"  ("actor_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_audit_log_occurred_at" ON "audit_log"  ("occurred_at") `);
        // The table is append-only by design: even a direct connection as the
        // application's own DB user can no longer UPDATE or DELETE a row.
        // TRUNCATE is revoked too, beyond the letter's literal "UPDATE, DELETE":
        // it is its own ACL bit, distinct from DELETE, so a role that still held
        // it could wipe the entire chain in one statement — a bigger hole than
        // altering a single row.
        await queryRunner.query(`REVOKE UPDATE, DELETE, TRUNCATE ON "audit_log" FROM "${APPLICATION_DB_USER}"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`GRANT UPDATE, DELETE, TRUNCATE ON "audit_log" TO "${APPLICATION_DB_USER}"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_audit_log_occurred_at"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_audit_log_actor_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_audit_log_action"`);
        await queryRunner.query(`DROP TABLE "audit_log"`);
        await queryRunner.query(`DROP TYPE "public"."audit_log_action_enum"`);
    }

}
