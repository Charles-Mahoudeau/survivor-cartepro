import { Column, CreateDateColumn, Entity, Index } from 'typeorm';
import { PrimaryGeneratedUuidV7Column } from '@/common/decorators/primary-generated-uuid-v7.column';
import { AuditAction } from '@/modules/audit/enums/audit-action.enum';

/**
 * One row per sensitive operation. Append-only: `AuditRepo` exposes no
 * update or delete method, and the table's migration revokes those grants
 * from the application's own DB user, so the guarantee holds even against a
 * direct connection to the database.
 *
 * `hash` and `previousHash` form the integrity chain: `hash` covers this
 * row's own fields (see `computeChainHash`), and `previousHash` is the
 * `hash` of the row immediately before it. `previousHash` is null only on
 * the chain's first row.
 */
@Entity('audit_log')
@Index('IDX_audit_log_occurred_at', ['occurredAt'])
@Index('IDX_audit_log_actor_id', ['actorId'])
@Index('IDX_audit_log_action', ['action'])
export class Audit {
  @PrimaryGeneratedUuidV7Column()
  id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  occurredAt: Date;

  /** Null for an action with no signed-in actor (e.g. a failed login). */
  @Column({ type: 'uuid', nullable: true })
  actorId: string | null;

  @Column({ type: 'text', nullable: true })
  actorRole: string | null;

  @Column({ type: 'enum', enum: AuditAction })
  action: AuditAction;

  @Column({ type: 'text' })
  targetType: string;

  @Column({ type: 'text', nullable: true })
  targetId: string | null;

  @Column({ type: 'jsonb', nullable: true })
  payload: Record<string, unknown> | null;

  @Column({ type: 'text', nullable: true })
  ip: string | null;

  @Column({ type: 'text', nullable: true })
  previousHash: string | null;

  @Column({ type: 'text' })
  hash: string;
}
