import { Injectable, Logger } from '@nestjs/common';
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
      await this.auditRepo.transaction(async (manager) => {
        await this.auditRepo.lockChain(manager);
        const latest = await this.auditRepo.findLatest(manager);
        const previousHash = latest?.hash ?? null;
        const hash = computeChainHash({ ...entry, previousHash });

        await this.auditRepo.append({ ...entry, previousHash, hash }, manager);
      });
    } catch (error) {
      this.logger.error(
        `Failed to append an audit log entry (action=${entry.action}, targetType=${entry.targetType}, targetId=${entry.targetId})`,
        error,
      );
    }
  }
}
