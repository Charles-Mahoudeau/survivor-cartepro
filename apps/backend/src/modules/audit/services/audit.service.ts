import { Injectable, Logger } from '@nestjs/common';
import type { EntityManager } from 'typeorm';
import { AuditRepo } from '@/modules/audit/repos/audit.repo';
import { AuditAction } from '@/modules/audit/enums/audit-action.enum';
import { computeChainHash } from '@/modules/audit/services/helpers/chain-hash.helper';

export interface RecordAuditEntry {
  action: AuditAction;
  targetType: string;
  targetId: string | null;
  actorId: string | null;
  actorRole: string | null;
  payload: Record<string, unknown> | null;
  ip: string | null;
}

/**
 * The chain's own origin marker never targets a business entity: it exists
 * to say the chain itself began, not that something happened to a record.
 */
const CHAIN_ORIGIN_TARGET_TYPE = 'audit_chain';

const CHAIN_ORIGIN_NOTE =
  'Audit chain origin. Operations that happened before this entry predate ' +
  'the audit system and are not represented in the chain — see the ' +
  'integrity note for why fabricating them retroactively is not an option.';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly auditRepo: AuditRepo) {}

  /**
   * Appends one entry to the chain. Never throws: a failure here must not
   * fail the sensitive operation it is recording — by the time this runs,
   * the interceptor has already let the response go. A failure is logged
   * loudly instead, so an operator can reconcile the gap by hand.
   */
  async record(entry: RecordAuditEntry): Promise<void> {
    try {
      await this.auditRepo.transaction((manager) =>
        this.append(manager, entry, { onlyIfEmpty: false }),
      );
    } catch (error) {
      this.logger.error(
        `Failed to append an audit log entry (action=${entry.action}, targetType=${entry.targetType}, targetId=${entry.targetId})`,
        error,
      );
    }
  }

  /**
   * Writes the chain's first row, once, the first time the log is empty.
   * Called on every boot; a no-op past the very first one, since by then
   * `findLatest` no longer returns null.
   *
   * This is the decision the letter asks for on a journal that starts on an
   * already-populated database (see the one-page note, first paragraph): no
   * history is fabricated for the week of activity that predates it, and
   * this entry says so plainly instead.
   */
  async ensureChainOrigin(): Promise<void> {
    const entry: RecordAuditEntry = {
      action: AuditAction.ADMIN_ACTION,
      targetType: CHAIN_ORIGIN_TARGET_TYPE,
      targetId: null,
      actorId: null,
      actorRole: null,
      payload: { event: 'chain_origin', note: CHAIN_ORIGIN_NOTE },
      ip: null,
    };

    try {
      await this.auditRepo.transaction((manager) =>
        this.append(manager, entry, { onlyIfEmpty: true }),
      );
    } catch (error) {
      this.logger.error('Failed to write the audit chain origin entry', error);
    }
  }

  private async append(
    manager: EntityManager,
    entry: RecordAuditEntry,
    { onlyIfEmpty }: { onlyIfEmpty: boolean },
  ): Promise<void> {
    await this.auditRepo.lockChain(manager);
    const latest = await this.auditRepo.findLatest(manager);
    if (onlyIfEmpty && latest) {
      return;
    }

    const previousHash = latest?.hash ?? null;
    const hash = computeChainHash({ ...entry, previousHash });
    await this.auditRepo.append({ ...entry, previousHash, hash }, manager);
  }
}
