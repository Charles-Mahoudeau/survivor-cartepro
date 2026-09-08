import {
  BadRequestException,
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { EntityManager } from 'typeorm';
import { ERROR_CODES } from '@/common/constants/error-codes.constant';
import {
  InvalidCursorError,
  paginate,
  type CursorPage,
} from '@/common/pagination';
import {
  InvalidPeriodError,
  resolvePeriod,
  type Period,
  type PeriodQueryDto,
} from '@/common/period';
import type { Env } from '@/config/env/env.schema';
import { AuditRepo } from '@/modules/audit/repos/audit.repo';
import { AuditAction } from '@/modules/audit/enums/audit-action.enum';
import type { Audit } from '@/modules/audit/entities';
import { computeChainHash } from '@/modules/audit/services/helpers/chain-hash.helper';
import {
  signAuditExport,
  type SignedAuditExport,
} from '@/modules/audit/services/helpers/export-signer.helper';
import type { AuditResponseDto, ListAuditQueryDto } from '../validators';

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

  constructor(
    private readonly auditRepo: AuditRepo,
    private readonly configService: ConfigService<Env, true>,
  ) {}

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

  /** The admin read side: a filtered, paginated view over the chain. */
  async list(query: ListAuditQueryDto): Promise<CursorPage<AuditResponseDto>> {
    let period: Period;
    try {
      period = resolvePeriod(query);
    } catch (error) {
      if (error instanceof InvalidPeriodError) {
        throw new UnprocessableEntityException(ERROR_CODES.INVALID_PERIOD);
      }
      throw error;
    }

    let rows: Audit[];
    try {
      rows = await this.auditRepo.findPage(query, {
        period,
        actorId: query.actorId,
        action: query.action,
      });
    } catch (error) {
      if (error instanceof InvalidCursorError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }

    return paginate(rows, query.limit);
  }

  /**
   * A signed, self-contained snapshot of one period: entries oldest first,
   * a compact chain digest, and an HMAC-SHA256 signature over the whole
   * thing. Verifiable later with the exported file and the signing secret
   * alone — see `scripts/audit-verify.ts`, which needs neither.
   */
  async exportPeriod(query: PeriodQueryDto): Promise<SignedAuditExport> {
    let period: Period;
    try {
      period = resolvePeriod(query);
    } catch (error) {
      if (error instanceof InvalidPeriodError) {
        throw new UnprocessableEntityException(ERROR_CODES.INVALID_PERIOD);
      }
      throw error;
    }

    const rows = await this.auditRepo.findRange(period);
    const entries = rows.map((row) => ({
      id: row.id,
      occurredAt: row.occurredAt.toISOString(),
      actorId: row.actorId,
      actorRole: row.actorRole,
      action: row.action,
      targetType: row.targetType,
      targetId: row.targetId,
      payload: row.payload,
      ip: row.ip,
      previousHash: row.previousHash,
      hash: row.hash,
    }));

    const secret = this.configService.get('AUDIT_EXPORT_SIGNING_SECRET', {
      infer: true,
    });

    return signAuditExport(
      {
        period: {
          from: period.from.toISOString(),
          to: period.to?.toISOString() ?? null,
        },
        entries,
        chainDigest: entries.at(-1)?.hash ?? null,
      },
      secret,
    );
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
