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
import { ApplicationRepo } from '@/modules/partners/applications/repos';
import {
  ListApplicationsQueryDto,
  ApplicationDetailResponseDto,
  ApplicationResponseDto,
  DecideApplicationDto,
} from '@/modules/partners/applications/dto';
import { ApplicationDecision } from '@/modules/partners/applications/enums';

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly partnerService: PartnerService,
    private readonly applicationRepo: ApplicationRepo,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async list(
    query: ListApplicationsQueryDto,
  ): Promise<CursorPage<ApplicationResponseDto>> {
    const page = await this.partnerService.listByStatus(query.status, query);

    return {
      ...page,
      items: page.items.map((partner) => this.toResponse(partner)),
    };
  }

  async getById(id: string): Promise<ApplicationDetailResponseDto> {
    const partner = await this.partnerService.findForReview(id);
    return this.toDetailResponse(partner);
  }

  async getMine(ownerId: string): Promise<ApplicationDetailResponseDto> {
    const partner = await this.partnerService.findMineForReview(ownerId);
    return this.toDetailResponse(partner);
  }

  async decide(
    id: string,
    dto: DecideApplicationDto,
    decidedById: string,
  ): Promise<ApplicationDetailResponseDto> {
    const toStatus =
      dto.decision === ApplicationDecision.APPROVED
        ? PartnerStatus.ACTIVE
        : PartnerStatus.REFUSED;

    const partner = await this.dataSource.transaction(async (manager) => {
      const decided =
        dto.decision === ApplicationDecision.APPROVED
          ? await this.partnerService.activate(id, manager)
          : await this.partnerService.refuse(id, manager);

      await this.applicationRepo.create(
        {
          partner: decided,
          fromStatus: PartnerStatus.PENDING,
          toStatus,
          reason: dto.reason,
          decidedById,
        },
        manager,
      );

      return decided;
    });

    return this.toDetailResponse(partner);
  }

  private toResponse(partner: Partner): ApplicationResponseDto {
    return plainToInstance(
      ApplicationResponseDto,
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

  private toDetailResponse(partner: Partner): ApplicationDetailResponseDto {
    return plainToInstance(
      ApplicationDetailResponseDto,
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
