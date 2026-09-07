import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { EntityManager } from 'typeorm';
import { Repository } from 'typeorm';
import { Application } from '@/modules/partners/applications/entities/application.entity';
import type { Partner } from '@/modules/partners/core/entities/partner.entity';
import type { PartnerStatus } from '@/modules/partners/core/enums/partner-status.enum';

interface ApplicationDecision {
  partner: Partner;
  fromStatus: PartnerStatus;
  toStatus: PartnerStatus;
  reason: string;
  decidedById: string;
}

@Injectable()
export class ApplicationRepo {
  constructor(
    @InjectRepository(Application)
    private readonly applications: Repository<Application>,
  ) {}

  create(
    decision: ApplicationDecision,
    manager?: EntityManager,
  ): Promise<Application> {
    const repo = manager
      ? manager.getRepository(Application)
      : this.applications;

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
