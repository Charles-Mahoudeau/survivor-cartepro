import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import {
  InvalidCursorError,
  paginate,
  type CursorPage,
} from '@/common/pagination';
import { ERROR_CODES } from '@/common/constants/error-codes.constant';
import {
  ListPartnersQueryDto,
  PartnerProfileResponseDto,
  PartnerResponseDto,
  UpdatePartnerProfileDto,
} from '@/modules/partners/core/dto';
import { PartnerRepo } from '@/modules/partners/core/repos';
import type { Partner } from '@/modules/partners/core/entities/partner.entity';

@Injectable()
export class PartnerService {
  constructor(private readonly partnerRepo: PartnerRepo) {}

  async findPublicById(id: string): Promise<PartnerResponseDto> {
    const partner = await this.partnerRepo.findActiveById(id);

    if (!partner) {
      throw new NotFoundException(ERROR_CODES.PARTNER_NOT_FOUND);
    }

    return this.toPublicResponse(partner);
  }

  async getProfileByOwnerId(
    ownerId: string,
  ): Promise<PartnerProfileResponseDto> {
    const partner = await this.partnerRepo.findByOwnerId(ownerId);

    if (!partner) {
      throw new NotFoundException(ERROR_CODES.PARTNER_NOT_FOUND);
    }

    return this.toProfileResponse(partner);
  }

  async getProfileByPartnerId(
    partnerId: string,
  ): Promise<PartnerProfileResponseDto> {
    const partner = await this.partnerRepo.findByIdWithDetails(partnerId);

    if (!partner) {
      throw new NotFoundException(ERROR_CODES.PARTNER_NOT_FOUND);
    }

    return this.toProfileResponse(partner);
  }

  async updateProfileByOwnerId(
    ownerId: string,
    dto: UpdatePartnerProfileDto,
  ): Promise<PartnerProfileResponseDto> {
    const partner = await this.partnerRepo.findByOwnerId(ownerId);

    if (!partner) {
      throw new NotFoundException(ERROR_CODES.PARTNER_NOT_FOUND);
    }

    return this.applyProfileUpdate(partner, dto);
  }

  async updateProfileByPartnerId(
    partnerId: string,
    dto: UpdatePartnerProfileDto,
  ): Promise<PartnerProfileResponseDto> {
    const partner = await this.partnerRepo.findByIdWithDetails(partnerId);

    if (!partner) {
      throw new NotFoundException(ERROR_CODES.PARTNER_NOT_FOUND);
    }

    return this.applyProfileUpdate(partner, dto);
  }

  private async applyProfileUpdate(
    partner: Partner,
    dto: UpdatePartnerProfileDto,
  ): Promise<PartnerProfileResponseDto> {
    if (dto.categories !== undefined) {
      const categories = await this.partnerRepo.findCategoriesBySlugs(
        dto.categories,
      );
      if (categories.length !== dto.categories.length) {
        throw new BadRequestException(
          'One or more category slugs do not exist',
        );
      }
      partner.categories = categories;
    }

    if (dto.legalName !== undefined) partner.legalName = dto.legalName;
    if (dto.tradeName !== undefined) partner.tradeName = dto.tradeName;
    if (dto.siren !== undefined) partner.siren = dto.siren;
    if (dto.businessPurpose !== undefined) {
      partner.businessPurpose = dto.businessPurpose;
    }
    if (dto.addressLine !== undefined) partner.addressLine = dto.addressLine;
    if (dto.postalCode !== undefined) partner.postalCode = dto.postalCode;
    if (dto.city !== undefined) partner.city = dto.city;
    if (dto.latitude !== undefined) partner.latitude = dto.latitude;
    if (dto.longitude !== undefined) partner.longitude = dto.longitude;

    const saved = await this.partnerRepo.savePartner(partner);
    return this.toProfileResponse(saved);
  }

  async listPublic(
    query: ListPartnersQueryDto,
  ): Promise<CursorPage<PartnerResponseDto>> {
    let partners: Awaited<ReturnType<PartnerRepo['findActivePage']>>;
    try {
      partners = await this.partnerRepo.findActivePage(query);
    } catch (error) {
      if (error instanceof InvalidCursorError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }

    const page = paginate<
      Awaited<ReturnType<PartnerRepo['findActivePage']>>[number]
    >(partners, query.limit);

    return {
      ...page,
      items: page.items.map((partner) => this.toPublicResponse(partner)),
    };
  }

  private toProfileResponse(partner: Partner): PartnerProfileResponseDto {
    const latestReview = partner.reviews?.[0] ?? null;

    return plainToInstance(
      PartnerProfileResponseDto,
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
        lastDecision: latestReview
          ? {
              reason: latestReview.reason,
              toStatus: latestReview.toStatus,
              createdAt: latestReview.createdAt,
            }
          : null,
      },
      { excludeExtraneousValues: true },
    );
  }

  private toPublicResponse(
    partner: NonNullable<Awaited<ReturnType<PartnerRepo['findActiveById']>>>,
  ): PartnerResponseDto {
    return plainToInstance(
      PartnerResponseDto,
      {
        id: partner.id,
        legalName: partner.legalName,
        tradeName: partner.tradeName,
        addressLine: partner.addressLine,
        postalCode: partner.postalCode,
        city: partner.city,
        latitude: Number(partner.latitude),
        longitude: Number(partner.longitude),
        categories: partner.categories.map(({ slug, displayName }) => ({
          slug,
          displayName,
        })),
      },
      { excludeExtraneousValues: true },
    );
  }
}
