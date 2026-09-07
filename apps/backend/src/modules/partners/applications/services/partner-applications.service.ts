import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { type CursorPage } from '@/common/pagination';
import { PartnerService, type Partner } from '@/modules/partners/core';
import {
  ListPartnerApplicationsQueryDto,
  PartnerApplicationResponseDto,
} from '@/modules/partners/applications/dto';

@Injectable()
export class PartnerApplicationsService {
  constructor(private readonly partnerService: PartnerService) {}

  async list(
    query: ListPartnerApplicationsQueryDto,
  ): Promise<CursorPage<PartnerApplicationResponseDto>> {
    const page = await this.partnerService.listByStatus(query.status, query);

    return {
      ...page,
      items: page.items.map((partner) => this.toResponse(partner)),
    };
  }

  private toResponse(partner: Partner): PartnerApplicationResponseDto {
    return plainToInstance(
      PartnerApplicationResponseDto,
      {
        id: partner.id,
        legalName: partner.legalName,
        tradeName: partner.tradeName,
        siren: partner.siren,
        city: partner.city,
        status: partner.status,
        createdAt: partner.createdAt,
      },
      { excludeExtraneousValues: true },
    );
  }
}
