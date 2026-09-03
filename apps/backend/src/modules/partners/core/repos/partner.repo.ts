import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Partner } from '@/modules/partners/core/entities/partner.entity';
import { PartnerStatus } from '@/modules/partners/core/enums/partner-status.enum';

@Injectable()
export class PartnerRepo {
  constructor(
    @InjectRepository(Partner)
    private readonly partners: Repository<Partner>,
  ) {}

  findActiveById(id: string): Promise<Partner | null> {
    return this.partners.findOne({
      where: { id, status: PartnerStatus.ACTIVE },
      relations: { categories: true },
    });
  }
}
