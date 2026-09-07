import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { EntityManager } from 'typeorm';
import { Repository } from 'typeorm';
import { PartnerApplication } from '@/modules/partners/applications/entities/partner-application.entity';
import type { Partner } from '@/modules/partners/core/entities/partner.entity';
import type { PartnerStatus } from '@/modules/partners/core/enums/partner-status.enum';

interface PartnerApplicationDecision {
  partner: Partner;
  fromStatus: PartnerStatus;
  toStatus: PartnerStatus;
  reason: string;
  decidedById: string;
}

@Injectable()
export class PartnerApplicationRepo {
  constructor(
    @InjectRepository(PartnerApplication)
    private readonly partnerApplications: Repository<PartnerApplication>,
  ) {}

  create(
    decision: PartnerApplicationDecision,
    manager?: EntityManager,
  ): Promise<PartnerApplication> {
    const repo = manager
      ? manager.getRepository(PartnerApplication)
      : this.partnerApplications;

    const entry = repo.create({
      partner: decision.partner,
      fromStatus: decision.fromStatus,
      toStatus: decision.toStatus,
      reason: decision.reason,
      decidedBy: { id: decision.decidedById },
    });

    return repo.save(entry);
  }
}
