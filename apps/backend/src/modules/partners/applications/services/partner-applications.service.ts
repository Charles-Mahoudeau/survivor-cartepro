import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import type { DataSource } from 'typeorm';
import { type CursorPage } from '@/common/pagination';
import {
  PartnerService,
  PartnerStatus,
  type Partner,
} from '@/modules/partners/core';
import { PartnerApplicationRepo } from '@/modules/partners/applications/repos';
import {
  ListPartnerApplicationsQueryDto,
  PartnerApplicationDetailResponseDto,
  PartnerApplicationResponseDto,
} from '@/modules/partners/applications/dto';

@Injectable()
export class PartnerApplicationsService {
  constructor(
    private readonly partnerService: PartnerService,
    private readonly partnerApplicationRepo: PartnerApplicationRepo,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async list(
    query: ListPartnerApplicationsQueryDto,
  ): Promise<CursorPage<PartnerApplicationResponseDto>> {
    const page = await this.partnerService.listByStatus(query.status, query);

    return {
      ...page,
      items: page.items.map((partner) => this.toResponse(partner)),
    };
  }

  async getById(id: string): Promise<PartnerApplicationDetailResponseDto> {
    const partner = await this.partnerService.findForReview(id);
    return this.toDetailResponse(partner);
  }

  async getMine(ownerId: string): Promise<PartnerApplicationDetailResponseDto> {
    const partner = await this.partnerService.findMineForReview(ownerId);
    return this.toDetailResponse(partner);
  }

  async approve(
    id: string,
    reason: string,
    decidedById: string,
  ): Promise<PartnerApplicationDetailResponseDto> {
    const partner = await this.dataSource.transaction(async (manager) => {
      const activated = await this.partnerService.activate(id, manager);

      await this.partnerApplicationRepo.create(
        {
          partner: activated,
          fromStatus: PartnerStatus.PENDING,
          toStatus: PartnerStatus.ACTIVE,
          reason,
          decidedById,
        },
        manager,
      );

      return activated;
    });

    return this.toDetailResponse(partner);
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

  private toDetailResponse(
    partner: Partner,
  ): PartnerApplicationDetailResponseDto {
    return plainToInstance(
      PartnerApplicationDetailResponseDto,
      {
        id: partner.id,
        legalName: partner.legalName,
        tradeName: partner.tradeName,
        siren: partner.siren,
        businessPurpose: partner.businessPurpose,
        status: partner.status,
        addressLine: partner.addressLine,
        postalCode: partner.postalCode,
        city: partner.city,
        latitude: Number(partner.latitude),
        longitude: Number(partner.longitude),
        categories: partner.categories.map(({ slug, displayName }) => ({
          slug,
          displayName,
        })),
        owner: {
          id: partner.owner.id,
          name: partner.owner.name,
          email: partner.owner.email,
        },
        createdAt: partner.createdAt,
        updatedAt: partner.updatedAt,
      },
      { excludeExtraneousValues: true },
    );
  }
}
