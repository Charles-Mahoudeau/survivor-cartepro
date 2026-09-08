import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { EntityManager, QueryDeepPartialEntity } from 'typeorm';
import { Repository } from 'typeorm';
import type { Period } from '@/common/period';
import { decodeCursor, type PaginationQueryDto } from '@/common/pagination';
import { Audit } from '@/modules/audit/entities';
import type { AuditAction } from '@/modules/audit/enums/audit-action.enum';

/** A row ready to append: every column except the ones the chain computes. */
export type NewAuditEntry = Omit<
  Audit,
  'id' | 'occurredAt' | 'previousHash' | 'hash'
> & {
  previousHash: string | null;
  hash: string;
};

export interface AuditListFilters {
  period: Period;
  actorId?: string;
  action?: AuditAction;
}

/** Advisory locks are process-wide; this key is scoped to this one chain. */
const CHAIN_LOCK_KEY = 'audit_log_chain';

/**
 * Append-only by construction: this class exposes no update or delete
 * method, and `insert` — never `save` — is used to write, which can only
 * create a row, never silently upsert one back.
 */
@Injectable()
export class AuditRepo {
  constructor(
    @InjectRepository(Audit)
    private readonly audits: Repository<Audit>,
  ) {}

  /** Starts a transaction on this repo's connection, for a caller to join. */
  transaction<T>(work: (manager: EntityManager) => Promise<T>): Promise<T> {
    return this.audits.manager.transaction(work);
  }

  /**
   * Serializes concurrent appends for the caller's transaction. Without
   * this lock, two concurrent writers could both read the same "latest"
   * row and each extend the chain from it, forking it instead of
   * extending a single line.
   *
   * Raw SQL, as an explicit, narrow exception (see
   * `.claude/rules/fix-architecture-orm-query-builder-pas-de-sql-brut.md`,
   * point 4): an advisory lock is a transaction-scoped side effect with no
   * table and no rows, so it has no `FROM` for the QueryBuilder to attach
   * to — giving it one (e.g. `.from(Audit, 'a')`) would call the function
   * once per existing row instead of once, and zero times on an empty
   * table, which is exactly the case of the chain's very first entry.
   */
  async lockChain(manager: EntityManager): Promise<void> {
    await manager.query('SELECT pg_advisory_xact_lock(hashtext($1))', [
      CHAIN_LOCK_KEY,
    ]);
  }

  /** Call only after `lockChain` in the same transaction. */
  findLatest(manager: EntityManager): Promise<Audit | null> {
    return manager
      .getRepository(Audit)
      .createQueryBuilder('audit')
      .orderBy('audit.id', 'DESC')
      .getOne();
  }

  /** Newest first, the order an operator reviewing recent activity wants. */
  findPage(
    query: PaginationQueryDto,
    filters: AuditListFilters,
  ): Promise<Audit[]> {
    const builder = this.audits
      .createQueryBuilder('audit')
      .where('audit.occurredAt >= :from', { from: filters.period.from })
      .orderBy('audit.id', 'DESC')
      .take(query.limit + 1);

    if (filters.period.to) {
      builder.andWhere('audit.occurredAt <= :to', { to: filters.period.to });
    }
    if (filters.actorId) {
      builder.andWhere('audit.actorId = :actorId', {
        actorId: filters.actorId,
      });
    }
    if (filters.action) {
      builder.andWhere('audit.action = :action', { action: filters.action });
    }
    if (query.cursor) {
      builder.andWhere('audit.id < :cursor', {
        cursor: decodeCursor(query.cursor),
      });
    }

    return builder.getMany();
  }

  async append(entry: NewAuditEntry, manager: EntityManager): Promise<Audit> {
    const repo = manager.getRepository(Audit);
    // `payload` is a jsonb column typed as a plain `Record<string, unknown>`,
    // which TypeORM's deep-partial insert type can't verify structurally —
    // the cast is only for that mismatch, not for the rest of the row.
    const result = await repo.insert(entry as QueryDeepPartialEntity<Audit>);
    const id = String(result.identifiers[0].id);
    return repo.findOneByOrFail({ id });
  }
}
